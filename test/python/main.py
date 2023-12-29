import json
from math import log
import random
from heapq import heapify, heappop, heappush, nsmallest
import numpy as np
from numpy.linalg import norm
from copy import deepcopy


def cosine_distance(a, b):
    return 1 - (a @ b.T) / (norm(a) * norm(b))  # type: ignore


def l2_distance(a, b):
    return norm(a - b)


def inner_product(a, b):
    return 1 - np.inner(a, b)


class Node:
    distance = 0.0
    id = 0

    def __init__(self, d, i):
        self.distance = d
        self.id = i


class HNSW:
    def __init__(self, M, ef_construction, ef_search):
        self.points = []
        self.graphs = []
        self.m = M  # Paper proposes [5,48] is a good range for m, m should increase as dimension size increases
        # Weaviate selects M as 64
        self.m_max0 = self.m * 2  # Papers proposed max0 is 2 times m
        self.ml = 1 / log(M)  # Papers heuristic to select ml, maximum layers
        self.ef_construction = ef_construction  # Profoundly affects build times, 400 is very powerful, 40 is fast
        self.ef = ef_search
        self.ep = None

    def select_layer(self):
        """
        Paper proposes this heuristic for layer selection for insertion of q
        :return:
        """
        return int(-log(random.random()) * self.ml)

    def get_vector(self, idx):
        return self.points[idx]

    def insert(self, q):
        ep_index = self.ep
        L = len(self.graphs) - 1  # the top layer in the graph, not sure of this
        l = self.select_layer()

        # if min(l, L) > 1:
        #     print("")

        idx = len(self.points)
        self.points.append(q)

        # if idx == 6:
        #     print("")

        if ep_index is not None:
            dist = cosine_distance(q, self.points[ep_index])
            ep = [(dist, ep_index)]

            for i in range(L, l, -1):  # for each layer from L to l+1
                W = self.search_layer(q, deepcopy(ep), ef=1, l_c=i)
                # Since ef=1, we only get one neighbor
                # If nearest neighbor found in layer i is closer than ep, then ep = nearest neighbor
                if len(W) > 0 and ep[0][0] > W[0][0]:
                    ep = W

            for l_c in range(min(L, l), -1, -1):
                W = self.search_layer(q, ep, self.ef_construction, l_c)

                self.graphs[l_c][idx] = {}
                ep = deepcopy(W)
                neighbors = self.select_neighbors_heuristic(q, W, l_c)
                # add bidirectional connections from neighbors to q at layer lc
                # if len(neighbors) == 0 and l_c == 0:
                #     print("")
                M = self.m_max0 if l_c == 0 else self.m

                for e in neighbors:
                    self.graphs[l_c][idx][e[1]] = e[0]
                    self.graphs[l_c][e[1]][idx] = e[0]

                for e in neighbors:
                    eConn = [(v, k) for k, v in self.graphs[l_c][e[1]].items()]
                    if len(eConn) > M:  # Shrink connections
                        eNewConn = self.select_neighbors_heuristic(
                            self.get_vector(e[1]), eConn, l_c
                        )
                        self.graphs[l_c][e[1]] = {ind: dist for dist, ind in eNewConn}

        for i in range(len(self.graphs), l + 1):
            self.graphs.append({idx: {}})
            self.ep = idx  # if l > L , set entry point to q

    def search_layer(self, q, ep, ef, l_c):
        """
        :param q: query element q
        :param ep: enter points ep
        :param ef: number of nearest to q
        :param l_c: layer number lc
        :return:
        """

        if not isinstance(ep, list):
            ep = [ep]

        V = set(p for _, p in ep)  # set of visited elements

        C = ep  # set of candidates
        heapify(C)  # this should be a min heap

        W = [(-mdist, p) for mdist, p in ep]  # dynamic list of found neighbors
        # make it a max_heap to retrieve farthest element
        heapify(W)  # this should be a max heap

        while C:
            c = heappop(C)  # extract nearest element from C
            c_v = c[0]  # get distance of c
            # get furthest distance from q, multiply by -1 to make get real distance
            f = nsmallest(1, W)[0]

            if c_v > -f[0]:
                break

            neighbors = [k for k, val in self.graphs[l_c][c[1]].items() if k not in V]
            dists = [cosine_distance(self.points[e], q) for e in neighbors]

            for e, dist in zip(neighbors, dists):
                # mdist = -dist
                V.add(e)
                f_dist = -f[0]
                if dist < f_dist or len(W) < ef:
                    heappush(C, (dist, e))
                    heappush(W, (-dist, e))
                    if len(W) > ef:
                        heappop(W)
        if ef == 1:
            if len(W) > 0:
                dd = [(-mdist, p) for mdist, p in W]
                heapify(dd)
                return [heappop(dd)]
            else:
                return []

        return [(-mdist, p) for mdist, p in W]

    def select_neighbors_heuristic(
        self, q, C, l_c, extendCandidates=False, keepPrunedConnections=True
    ):
        """
        Selects and Adds neighbors to the graph
        :param q:
        :param W:
        :param l_c:
        :return:
        """

        R = []
        W = C  # [(-dist, i) for dist, i in C]
        heapify(R)  # min heap
        heapify(W)  # min heap

        M = self.m if l_c > 0 else self.m_max0

        W_d = []  # queue for discarded candidates
        while len(W) > 0 and len(R) < M:
            e = heappop(W)  # extract nearest element from W to q
            r_top = nsmallest(1, R)  # point with minimum distance to q in all R
            if len(r_top) > 0:
                r_top = r_top[0]  # TODO: why do this at all?

            if len(R) == 0 or e[0] < r_top[0]:
                heappush(R, (e[0], e[1]))
            else:
                W_d.append((e[0], e[1]))

        if keepPrunedConnections:
            while len(W_d) > 0 and len(R) < M:
                heappush(R, heappop(W_d))

        return R

    def knn_search(self, q, K):
        W = []  # dynamic list of found neighbors
        ep_index = self.ep
        L = len(self.graphs) - 1  # the top layer in the graph, not sure of this

        dist = cosine_distance(q, self.points[ep_index])  # type: ignore
        ep = [(dist, ep_index)]

        for l_c in range(L, 0, -1):  # search from top layer to layer 1
            W = self.search_layer(q, ep, 1, l_c)
            ep = W

        ep = self.search_layer(q, ep, self.ef, l_c=0)

        res = nsmallest(K, ep)

        return res


if __name__ == "__main__":
    # dim = 200
    # num_elements = 100

    import json
    import time
    import numpy as np

    # f = h5py.File("glove-25-angular.hdf5", "r")
    # distances = f["distances"]
    # neighbors = f["neighbors"]
    # test = f["test"]
    # train = f["train"]
    # pprint.pprint()

    # # Generating sample data
    # data = np.array(np.float32(np.random.random((num_elements, dim))))
    # data_labels = np.arange(num_elements)
    # data = [train[i].tolist() for i in range(2000)]  # type: ignore

    with open("./data/data.json", "r") as f:
        # load training data
        train = json.load(f)

        # map to np array
        train = np.array(train)

        # create HNSW
        hnsw = HNSW(M=5, ef_construction=128, ef_search=20)

        st = time.time()
        for i in range(100):  # 2000
            hnsw.insert(train[i])  # type: ignore

        # print(len(hnsw.graphs[0]), len(hnsw.graphs[1]))
        # print(time.time() - st)
        # st = time.time()
        res = hnsw.knn_search(train[0], 10)  # type: ignore
        # print(time.time() - st)

        for r in res:
            # print(r[1], 1 - r[0])
            print(1 - r[0], r[1])
