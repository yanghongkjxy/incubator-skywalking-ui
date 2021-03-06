import { query } from '../services/graphql';
import { generateModal } from '../utils/utils';

const optionsQuery = `
  query ApplicationOption($duration: Duration!) {
    applicationId: getAllApplication(duration: $duration) {
      key: id
      label: name
    }
  }
`;

const dataQuery = `
  query BasicTraces($condition: TraceQueryCondition) {
    queryBasicTraces(condition: $condition) {
      traces {
        operationName
        duration
        start
        isError
        traceId
  }
      total
    }
  }
`;

const spanQuery = `query Spans($traceId: ID!) {
  queryTrace(traceId: $traceId) {
    spnas {
      traceId
      segmentId
      spanId
      parentSpanId
      refs {
        traceId
        parentSegmentId
        parentSpanId
        type
      }
      applicationCode
      startTime
      endTime
      operationName
      type
      peer
      component
      isError
      layer
      tags {
        key
        value
      }
      logs {
        time
        data {
          key
          value
        }
      }
    }
  }
}`;

export default generateModal({
  namespace: 'trace',
  state: {
    queryBasicTraces: {
      traces: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
    },
  },
  optionsQuery,
  dataQuery,
  effects: {
    *fetchSpans({ payload }, { call, put }) {
      const response = yield call(query, 'spans', { query: spanQuery, variables: payload.variables });
      yield put({
        type: 'saveSpans',
        payload: response,
        traceId: payload.variables.traceId,
      });
    },
  },
  reducers: {
    saveSpans(state, action) {
      const { traceId } = action;
      const { queryTrace: { spans } } = action.payload.data;
      const { data: { queryBasicTraces: { traces } } } = state;
      const trace = traces.find(t => t.traceId === traceId);
      trace.spans = spans;
      return {
        ...state,
      };
    },
  },
});
