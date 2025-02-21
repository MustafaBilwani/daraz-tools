import React, { useRef, useState } from 'react'
import * as XLSX from 'xlsx'

function Price() {

  const [productSkus, setProductSkus] = useState(null)
  const [productPrices, setProductPrices] = useState(null)
  const [mainData, setMainData] = useState(null)
  const [campaignData, setCampaignData] = useState(null)
  const [fileName, setFileName] = useState('')

  const skuInputRef = useRef(null);
  const priceInputRef = useRef(null);
  const mainDataInputRef = useRef(null);
  const campaignDataInputRef = useRef(null);

  function processData () {

    if (!productPrices || !productSkus || !mainData){
      alert('all files required')
      return
    }

    mainData.forEach((x) => {
      let sku = x['SellerSKU']

      let product = productSkus[sku] || ''

      let dataInCampaignSheet = campaignData.find((y) => {
        return y['Seller SKU'] === sku
      })

      let campaignPrice = dataInCampaignSheet ? dataInCampaignSheet['Campaign Price（Mandatory）'] : ''

      if(!campaignPrice){
        if (productPrices[product]) {
          x['SpecialPrice'] = productPrices[product]
  
          if (x['SpecialPrice'] > x['*Price']) {
            x['*Price'] = x['SpecialPrice'] * 1.7
          }
        }
      }

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
      const name = item['Product Name']; // Column with the item name
      const listingPrice = item["LISTING PRICE"]; // Column with the listing price

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
   
  async function handleMainSheetInput(e) {

    const file = e.target.files[0]
    
    if (!file) {
      clearFile('main')
      return;
    }
    
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    console.log(jsonData)

    if (jsonData[0]['SpecialPrice'] && jsonData[0]['SellerSKU']) {
      setMainData(jsonData)
    } else {
      alert('enter valid file');
      clearFile('main')
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
      clearFile('campaign')
      return
    }

    if (!jsonData[0]['Seller SKU']) {
      jsonData.shift()
    }

    setCampaignData(jsonData)
    console.log(jsonData)
    
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
    } else if (type === 'campaign') {
      setCampaignData(null);
      campaignDataInputRef.current.value = ''; // Clear the file input
    }
  }

  return (
    <>
      <h1>Price</h1>

      <h2>Price Input</h2>
      <input type="file" ref={priceInputRef} onChange={handlePriceSheetInput} />
      {productPrices && (
        <button onClick={() => clearFile('price')}>Remove</button>
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

      <h2>Campaign Sheet Input</h2>
      <input type="file" ref={campaignDataInputRef} onChange={handleCampaignSheetInput} />
      {campaignData && (
        <button onClick={() => clearFile('campaign')}>Remove</button>
      )}

      <br /><br />
      <label htmlFor="">File name:</label>
      <br />
      <input type="text" value={fileName} onChange={(e) => {setFileName(e.target.value)}} />
      <br />
      <button onClick={processData} style={{marginTop: '20px'}}>Process</button>
    </>
  )
}

export default Price