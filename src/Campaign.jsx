import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';


export default function Campaign () {

  const [productSkus, setProductSkus] = useState(null)
  const [productPrices, setProductPrices] = useState(null)
  const [mainData, setMainData] = useState(null)
  const [fileName, setFileName] = useState('')

  const skuInputRef = useRef(null);
  const priceInputRef = useRef(null);
  const mainDataInputRef = useRef(null);

  function processData () {

    if (!productPrices || !productSkus || !mainData){
      alert('all files required')
      return
    }

    mainData.forEach((x) => {
      let product = productSkus[x['Seller SKU']] || ''

      x['Campaign Price（Mandatory）'] = productPrices[product] > x['Campaign Price（Mandatory）'] ?
        '' : 
        productPrices[product] || ''
    })

    console.log(mainData)

    var wb = XLSX.utils.book_new()
    var ws = XLSX.utils.json_to_sheet(mainData);

    XLSX.utils.book_append_sheet(wb, ws, 'sheet1')

    XLSX.writeFile(wb, (fileName || 'file') + '.xlsx')

  }

  async function handleProductSkuSheetInput(e) {

    const file = e.target.files[0];

    if (!file) {
      clearFile('sku')
      return;
    }

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

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

    if ( Object.keys(skuObject).length > 0 ) {
      setProductSkus(skuObject) 
    } else {
      alert('enter valid file');
      clearFile('sku')    
    }
  }

  async function handleCampaignSheetInput(e) {
    
    const file = e.target.files[0]
    
    if (!file) {
      clearFile('main')
      return;
    }
    
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    if (!jsonData[1]['Seller SKU']) {
      alert('enter valid file');
      clearFile('main')
      return
    }

    if (!jsonData[0]['Seller SKU']) {
      jsonData.shift()
    }

    setMainData(jsonData)
    console.log(jsonData)
    
  }

  async function handlePriceSheetInput (e) {
    
    const file = e.target.files[0]
    
    if (!file) {
      clearFile('price')
      return;
    }
    
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    const priceObject = jsonData.reduce((acc, item) => {
      const name = item['Products']; // Column with the item name
      const listingPrice = item["final listing price"]; // Column with the listing price

      if (name && listingPrice) {
        acc[name] = listingPrice;
      }

      return acc;
    }, {});

    if (Object.keys(priceObject).length > 0) {
      setProductPrices(priceObject)
    } else {
      alert('enter valid file');
      clearFile('price')    
    }
    
  }

  function clearFile(type) {
    if (type === 'sku') {
      setProductSkus(null);
      skuInputRef.current.value = ''; // Clear the file input
    } else if (type === 'price') {
      setProductPrices(null);
      priceInputRef.current.value = ''; // Clear the file input
    } else if (type === 'main') {
      setMainData(null);
      mainDataInputRef.current.value = ''; // Clear the file input
    }
  }

  return (
    <>
      <h1>Campaign Sheet Management</h1>

      <h2>Campaign Price Input</h2>
      <input type="file" ref={priceInputRef} onChange={handlePriceSheetInput} />
      {productPrices && (
        <button onClick={() => clearFile('price')}>Remove</button>
      )}

      <h2>Product SKU Input</h2>
      <input type="file" ref={skuInputRef} onChange={handleProductSkuSheetInput} />
      {productSkus && (
        <button onClick={() => clearFile('sku')}>Remove</button>
      )}

      <h2>Campaign Sheet Input</h2>
      <input type="file" ref={mainDataInputRef} onChange={handleCampaignSheetInput} />
      {mainData && (
        <button onClick={() => clearFile('main')}>Remove</button>
      )}

      <br /><br />
      <label htmlFor="">File name:</label>
      <br />
      <input type="text" value={fileName} onChange={(e) => {setFileName(e.target.value)}} />
      <br />
      <button onClick={processData} style={{marginTop: '20px'}}>Process</button>
    </>
  );
}