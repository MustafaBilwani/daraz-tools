import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const FileMerger = () => {

  const inputRef = useRef(null);

  const handleChange = async (e) => {
    const files = [...e.target.files];
    if (!files.length) {
      return;
    }
    let combinedData = [];
  
    for (let i = 0; i < files.length; i++) {
      const data = await files[i].arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const aoaData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
      if (i === 0) {
        combinedData = [...combinedData, ...aoaData]; // Merge data
      } else {
        combinedData = [...combinedData, ...aoaData.slice(1)]
      }
    }
  
    console.log(combinedData);
  
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(combinedData);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
  
    XLSX.writeFile(wb, "merged.xlsx");
  };
  
  

  return (
    <>
      Input files <br />
      <input type="file" ref={inputRef} onChange={handleChange} multiple />
    </>  
  )
}

export default FileMerger