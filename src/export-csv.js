
/**
 * 前端全量导出
 * @param {exportFilename} num excel表名
 * @param {columns}  table表头
 * @param {data} 表格数据
*/
const resolveFieldData = (data, field) => {
  let result;

  if (data && typeof field !== 'undefined') {
    if (typeof data[field] === 'undefined') {
      result = null;
    } else {
      result = data[field];
    }
  } else {
    result = null;
  }

  return (result === null || typeof result === 'undefined') ? '' : result;
}

const getCSVText = (columns, data, saveHead) => {
  const separator = ','; // \t
  let csv = '';

  if (saveHead) {
    for (let i = 0; i < columns.length; i++) {
      if (typeof columns[i].dataIndex !== 'undefined') {
        csv += columns[i].title || columns[i].dataIndex;

        if (i < (columns.length - 1)) {
          csv += separator;
        }
      }
    }
  }

  const connect = (record, index) => {
    if (saveHead || index) {
      csv += '\n';
    }
    // csv += '\n';
    for (let i = 0; i < columns.length; i++) {
      if (typeof columns[i].dataIndex !== 'undefined') {
        csv += resolveFieldData(record, columns[i].dataIndex);

        if (i < (columns.length - 1)) {
          csv += separator;
        }
      }
    }
  };

  if (data && data.length) {
    data.forEach(connect);
  }

  console.log(csv);

  return csv;
}

const exportCSV = (exportFilename, columns, data, saveHead = true) => {
  let csv = getCSVText(columns, data, saveHead);

  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });

  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob, exportFilename + '.csv');
  } else {
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    if (link.download !== undefined) {
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', exportFilename + '.csv');
      document.body.appendChild(link);
      link.click();
    } else {
      csv = 'data:text/csv;charset=utf-8,' + csv;
      window.open(encodeURI(csv));
    }
    document.body.removeChild(link);
  }
}

export default exportCSV;
