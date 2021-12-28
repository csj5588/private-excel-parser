import React, { useState, useCallback } from 'react';
import _isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import exportCSV from './export-csv';
import { Upload, Button, Table } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import readXlsxFile from 'read-excel-file'

import './App.css';

function App() {
  const [tableData, setTableData] = useState([]);
  const [csvTitle, setCsvTitle] = useState('所有人');
  const [cacheTableData, setCacheTableData] = useState([]);

  const columns = [
    {
      title: '工号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '部门',
      dataIndex: 'departement',
      key: 'departement',
    },
    {
      title: '部门',
      dataIndex: 'departement2',
      key: 'departement2',
    },
    {
      title: '打卡时间',
      dataIndex: 'clockTime',
      key: 'clockTime',
      render: (...rest) => {
        const [text] = rest;
        return (
          <div>
            {
              text.map((x, i) => {
                return <p key={i}>{x}</p>
              })
            }
          </div>
        )
      }
    },
    {
      title: '详情',
      dataIndex: 'detail',
      key: 'detail',
      width: 300,
      render: (...rest) => {
        const [text, record] = rest;
        var clockTimeList = record.clockTime;
        var onlyOneTime = clockTimeList.length < 2;
        // 计算时间差
        var workTime = listToWorkTime(clockTimeList);
        var hasTwoClock = clockTimeList.length > 1 && workTime > 8;

        return (
          <div>
            <p>打卡次数: {clockTimeList.length}</p>
            <p className={hasTwoClock ? 'detail-status-green' : 'detail-status-red'}>打卡状态: {hasTwoClock ? '已完成' : '未完成'}</p>
            {!onlyOneTime && <p>工作时长: <span className="detail-workTime">{workTime}</span></p>}
          </div>
        )
      }
    }
  ]

  const props = {
    onRemove: file => {
    },
    beforeUpload: file => {
      readXlsxFile(file).then((rows) => {
        // 删除表头
        rows.shift();
        rows.shift();

        // 转化为对象
        const _transfromObj = {};

        rows.forEach(item => {
          const id = item[0];
          const name = item[1];
          const departement = item[2];
          const departement2 = item[3];
          const clockTime = item[4];
          if (_isEmpty(_transfromObj[id])) {
            _transfromObj[id] = {
              id,
              name,
              departement,
              departement2,
              clockTime: [clockTime],
            }
          } else {
            _transfromObj[id].clockTime.push(clockTime);
          }
        });

        // 转化为table data
        const _tableData = Object.keys(_transfromObj).map(k => _transfromObj[k]);
        setTableData(_tableData);
        setCacheTableData(_tableData);

      })
      return false;
    },
  };

  const showAllData = useCallback(
    () => {
      setTableData(cacheTableData);
      setCsvTitle('所有人')
    },
    [cacheTableData],
  );

  const showUnFinishData = useCallback(
    () => {
      const _unFinishData = cacheTableData.filter(item => {
        if (item.clockTime.length < 2) return true;

        var workTime = listToWorkTime(item.clockTime);

        return workTime < 8;
      });
      setTableData(_unFinishData);
      setCsvTitle('未完成人')
    },
    [cacheTableData],
  );

  const showFinishData = useCallback(
    () => {
      const _finishData = cacheTableData.filter(item => {
        if (item.clockTime.length < 2) return false;

        var workTime = listToWorkTime(item.clockTime);

        return workTime >= 8;
      });
      setTableData(_finishData);
      setCsvTitle('已完成人')
    },
    [cacheTableData],
  );

  const exportExcel = useCallback(
    () => {
      exportCSV(csvTitle, columns, tableData);
    },
    [tableData, csvTitle],
  );

  return (
    <div className="App">
      <div className="action">
        <div className="left">
          <Upload {...props}>
            <Button icon={<UploadOutlined />}>首先导入.xlsx文件</Button>
          </Upload>
        </div>
        <div className="middle">
          <Button
            type="primary"
            style={{ marginLeft: '10px' }}
            onClick={showAllData}
          >展示所有人</Button>
          <Button
            type="primary"
            style={{ marginLeft: '10px' }}
            onClick={showUnFinishData}
          >展示未完成的人</Button>
          <Button
            type="primary"
            style={{ marginLeft: '10px' }}
            onClick={showFinishData}
          >展示已完成的人</Button>
        </div>
        <div className="right">
          <Button
            danger
            type="dashed"
            style={{ marginLeft: '10px' }}
            onClick={exportExcel}
          >导出当前表格</Button>
        </div>
      </div>
      <div className="table">
        <Table
          dataSource={tableData}
          columns={columns}
          rowKey={record => record.id}
          pagination={false}
        />
      </div>
    </div>
  );
}

const listToWorkTime = list => {
  var workTime = 0;
  var startTime = list[0];
  var endTime = list[list.length - 1];

  var workTimeFloat = moment(endTime).diff(moment(startTime), 'minute') / 60;
  var workTime = parseInt(workTimeFloat * 100) / 100;
  return workTime;
}

export default App;
