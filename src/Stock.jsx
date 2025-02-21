import React, { useRef, useState } from 'react'
import {writeFile, read, utils} from 'xlsx'

const {sheet_to_json, book_new, json_to_sheet, book_append_sheet} = utils

const Stock = () => {

  const [productSkus, setProductSkus] = useState(null)
  const [productStock, setProductStock] = useState(null)
  const [mainData, setMainData] = useState(null)
  const [fileName, setFileName] = useState('')

  const skuInputRef = useRef(null);
  const stockInputRef = useRef(null);
  const mainDataInputRef = useRef(null);

  function processData () {

    if (!productStock || !productSkus || !mainData){
      alert('all files required')
      return
    }

    mainData.forEach((x) => {
      let sku = x['SellerSKU']

      let product = productSkus[sku] || ''

      if (productStock[product]) {
        x['*Quantity'] = productStock[product]
      }
    })

    console.log('processed data', mainData)

    var wb = book_new()
    var ws = json_to_sheet(mainData);

    book_append_sheet(wb, ws, 'sheet1')

    writeFile(wb, (fileName || 'file') + '.xlsx')
  }

  async function handleProductSkuSheetInput(e) {

    const file = e.target.files[0];

    if (!file) {
      clearFile('sku')
      return;
    }

    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = sheet_to_json(worksheet);

    const skuObject = jsonData.reduce((acc, item) => {
      const productName = item["product name"];
      
      if (productName) {

        Object.keys(item)
          .filter(key => key.startsWith('SKU'))
          .forEach(key => {
            const sku = item[key];
            if (sku) {
              acc[sku] = productName; // Set SKU as key and product name as value
            }
          });
      }

      return acc;
    }, {});

    console.log(skuObject)

    if ( Object.keys(skuObject).length > 0 ) {
      setProductSkus(skuObject) 
    } else {
      alert('enter valid file');
      clearFile('sku')    
    }
  }

  async function handleStockSheetInput (e) {
    
    const file = e.target.files[0]
    
    if (!file) {
      clearFile('stock')
      return;
    }
    
    const data = await file.arrayBuffer();
    const workbook = read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    const jsonData = sheet_to_json(worksheet)

    const stockObject = jsonData.reduce((acc, item) => {
      const name = item['Product Name']; // Column with the item name
      const stock = item["Stock"]; // Column with the stock

      if (name && stock) {
        acc[name] = stock;
      }

      return acc;
    }, {});

    if (Object.keys(stockObject).length > 0) {
      console.log('stock object', stockObject)
      setProductStock(stockObject)
    } else {
      alert('enter valid file');
      clearFile('stock')    
    }
  }
   
  async function handleMainSheetInput(e) {

    const file = e.target.files[0]
    
    if (!file) {
      clearFile('main')
      return;
    }
    
    const data = await file.arrayBuffer();
    const workbook = read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    const jsonData = sheet_to_json(worksheet)

    console.log('main sheet data', jsonData)

    if (jsonData[0]['SpecialPrice'] && jsonData[0]['SellerSKU']) {
      setMainData(jsonData)
    } else {
      alert('enter valid file');
      clearFile('main')
    }
  }

  function clearFile(type) {
    if (type === 'sku') {
      setProductSkus(null);
      skuInputRef.current.value = ''; // Clear the file input
    } else if (type === 'stock') {
      setProductStock(null);
      stockInputRef.current.value = ''; // Clear the file input
    } else if (type === 'main') {
      setMainData(null);
      mainDataInputRef.current.value = ''; // Clear the file input
    }
  }

  return (
    <>
      <h1>Stock</h1>

      <h2>Stock Input</h2>
      <input type="file" ref={stockInputRef} onChange={handleStockSheetInput} />
      {productStock && (
        <button onClick={() => clearFile('stock')}>Remove</button>
      )}

      <h2>Product SKU Input</h2>
      <input type="file" ref={skuInputRef} onChange={handleProductSkuSheetInput} />
      {productSkus && (
        <button onClick={() => clearFile('sku')}>Remove</button>
      )}

      <h2>Main Sheet Input</h2>
      <input type="file" ref={mainDataInputRef} onChange={handleMainSheetInput} />
      {mainData && (
        <button onClick={() => clearFile('main')}>Remove</button>
      )}
      
      <br /><br />
      <label>File name:</label>
      <br />
      <input type="text" value={fileName} onChange={(e) => {setFileName(e.target.value)}} />
      <br />
      <button onClick={processData} style={{marginTop: '20px'}}>Process</button>
    </>
  )
}

export default Stock