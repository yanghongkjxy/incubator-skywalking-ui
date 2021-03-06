import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Select, Card, Form } from 'antd';
import { AppTopology } from '../../components/Topology';
import { Panel, Ranking } from '../../components/Page';

const { Option } = Select;
const { Item: FormItem } = Form;

const middleColResponsiveProps = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 12,
  style: { marginBottom: 24, marginTop: 24 },
};

@connect(state => ({
  application: state.application,
  globalVariables: state.global.globalVariables,
}))
@Form.create({
  mapPropsToFields(props) {
    const { variables: { values, labels } } = props.application;
    return {
      applicationId: Form.createFormField({
        value: { key: values.applicationId ? values.applicationId : '', label: labels.applicationId ? labels.applicationId : '' },
      }),
    };
  },
})
export default class Application extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'application/initOptions',
      payload: { variables: this.props.globalVariables },
    });
  }
  componentWillUpdate(nextProps) {
    if (nextProps.globalVariables.duration === this.props.globalVariables.duration) {
      return;
    }
    this.props.dispatch({
      type: 'application/initOptions',
      payload: { variables: nextProps.globalVariables },
    });
  }
  handleSelect = (selected) => {
    this.props.dispatch({
      type: 'application/saveVariables',
      payload: {
        values: { applicationId: selected.key },
        labels: { applicationId: selected.label },
      },
    });
  }
  handleChange = (variables) => {
    this.props.dispatch({
      type: 'application/fetchData',
      payload: { variables },
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { variables: { values, options }, data } = this.props.application;
    return (
      <div>
        <Form layout="inline">
          <FormItem>
            {getFieldDecorator('applicationId')(
              <Select
                showSearch
                style={{ width: 200 }}
                placeholder="Select a application"
                labelInValue
                onSelect={this.handleSelect.bind(this)}
              >
                {options.applicationId && options.applicationId.map((app) => {
                    return (<Option key={app.key} value={app.key}>{app.label}</Option>);
                  })}
              </Select>
            )}
          </FormItem>
        </Form>
        <Panel
          variables={values}
          globalVariables={this.props.globalVariables}
          onChange={this.handleChange}
        >
          <Card
            bordered={false}
            bodyStyle={{ padding: 0, marginTop: 24 }}
          >
            <AppTopology elements={data.getApplicationTopology} layout={{ name: 'concentric', minNodeSpacing: 200 }} />
          </Card>
          <Row gutter={24}>
            <Col {...middleColResponsiveProps}>
              <Card
                title="Slow Service"
                bordered={false}
                bodyStyle={{ padding: '0px 10px' }}
              >
                <Ranking data={data.getSlowService} title="name" content="avgResponseTime" unit="ms" />
              </Card>
            </Col>
            <Col {...middleColResponsiveProps}>
              <Card
                title="Servers Throughput"
                bordered={false}
                bodyStyle={{ padding: '0px 10px' }}
              >
                <Ranking data={data.getServerThroughput} title="name" content="tps" unit="t/s" />
              </Card>
            </Col>
          </Row>
        </Panel>
      </div>
    );
  }
}
