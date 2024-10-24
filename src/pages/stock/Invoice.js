import React from 'react';
import {
  Col,
  Row,
  Nav,
  Card,
  Table,
  Form,
  Button,
  ButtonGroup,
  Breadcrumb,
  InputGroup,
  Dropdown,
} from "@themesberg/react-bootstrap";
import moment from "moment";
import "./style.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faGlobe, faPhone, faVoicemail } from '@fortawesome/free-solid-svg-icons';
import { addCompanyProfile, getCompany } from "../../services/companyService"

export class Invoice extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      search: "",
      company: props.company || null,
      loading: false,
      saving: false,
    };
  }

  totalCost = () => {
    const { cart_details } = this.props;

    var total = 0;
    for (let v = 0; v < cart_details.length; v++) {
      total += cart_details[v].cost * cart_details[v].qty_sold;
    }
    return total;
  };

  attributeCols = (attribute_name,attribute_value) => {
    if(attribute_name !== null){
      let attributes = new Array();
      let values=new Array();
      attributes = attribute_name.split(",");
      values=attribute_value.split(",");
      return values.map((attrs, key) => {
        return <div>
          <span style={{display:'inline-table'}}>
            {attrs+":"+`\xa0`+""+attributes[key]}
          </span>
         
          </div>;
      });
    }else{
      return <span>____</span>
    }
  };

  formatCurrency2(x) {
  
    if (x !== null && x !== 0 && x !== undefined) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${parts.join(".")}`;
    }
    return 0;
  }

  formatCurrency(y, x) {
    if (x !== 'null' && x !== '0') {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${y}${parts.join(".")}`;
    }
    return '0';
  }


  componentDidMount(){
    this.getCompany();
  }

  getCompany = () => {

    this.setState({ loading: true });
    getCompany().then(

      (res) => {
        console.log(res)
        this.setState({
          loading: false,
          company: res.company,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };


  render() {
    const { cart_details, transaction_id, payment_mode, sold_at, company, invoice} = this.props;

    return (
      <div style={{width:'80mm'}}>
        {Object.keys(cart_details).length !== 0 &&
          <body>
          <header>
              
              <div class="logo" style={{fontWeight:600, color:'black'}}><img width={100} src={`${company && company.logo_url}`} /></div>
             
          </header>
          <h1 style={{fontWeight:600, color:'black'}}> 
          {company.name !== null ? company.name :'Hayzee Computer Resources'}</h1>
              
          
                 
          <table>
            <tbody>
              <tr>
                  <th class="center-align" style={{fontWeight:600, color:'black'}} colspan="2"><span class="receipt">
                      {company && company.invoice_header}
                    </span></th>
              </tr>
              {company &&  <tr>
                  <th class="center-align" style={{fontWeight:600, color:'black'}} colspan="2"><span class="receipt">
                  <span><FontAwesomeIcon icon={faPhone} /> {company.phone_one}, &nbsp;{company.phone_two}</span><span>&nbsp;&nbsp;
                    <FontAwesomeIcon icon={faGlobe} />&nbsp;{company.website}</span>
                        </span></th>
              
                </tr>}
            </tbody>
          </table>
            
          <table class="bill-details" >
              <tbody>
              
                  <tr>
                  <td style={{fontWeight:600, color:'black', fontSize:12, padding:5}}><span>Transanction ID:{transaction_id}<br />
                    Created: {moment(sold_at).format('MMM D, YYYY')
                        }<br />
                        Mode of Payment: {payment_mode}
                  </span>
                  </td>
                  </tr>
                  <tr>
                  <td style={{fontWeight:600, color:'black', whiteSpace:'pre-line'}} colSpan={3}>
                    <span>
                     {company && company.address}
                    </span>
                  </td>
                  <td style={{fontWeight:600, color:'black'}}>
                    <span>
                      {/* {invoice.client.name}<br />
                      {invoice.client.address}<br />
                      {invoice.client.phone}<br/>
                      {invoice.client.email} */}

                    </span>
                  </td>
                  </tr>
                 
              </tbody>
          </table>
          
          <table class="items" style={{marginTop:10, marginBottom:10}}>
              <thead>
                  <tr>
                      <th class="heading name" style={{color:'black', textAlign:'justify', fontWeight:700}}>Item</th>
                      <th class="heading amount" style={{color:'black', textAlign:'justify', fontWeight:700}}></th>
                      <th class="heading qty"  style={{color:'black',  textAlign:'justify',paddingLeft:10,fontWeight:700}}>Qty</th>
                      <th class="heading rate"  style={{color:'black', textAlign:'justify',paddingLeft:10, fontWeight:700}}>Rate</th>
                      <th class="heading amount"  style={{color:'black', textAlign:'justify',paddingLeft:10, fontWeight:700}}>Cost</th>
                  </tr>
              </thead>
             
              <tbody>
              {Object.keys(cart_details).length !== 0 ? cart_details.map((item, key) => {

                return (
                  <tr>
                    <td><div class="row-spacing">{item.purchase_order.product_name}
                   </div></td>
                   <td><div class="row-spacing">
                   
                        {this.attributeCols(
                          JSON.parse(item.purchase_order.product_attributes),
                          JSON.parse(item.purchase_order.product_attributes_keys)
                        )}
                  
                   </div></td>
                      
                    <td><div class="row-spacing" style={{paddingLeft:10}}>{item.qty_sold}</div></td>
                    <td><div class="row-spacing" style={{paddingLeft:10}}>{item.cost}</div></td>
                    <td><div class="row-spacing" style={{paddingLeft:10}}>{this.formatCurrency2((item.cost*item.qty_sold))}</div></td>
                  </tr>

                );
                }) : ''}
                  
                  
                  <tr style={{marginTop:20}}>
                      <td colspan="4" class="sum-up line">Total</td>
                      <td class="line price">{this.formatCurrency2(this.totalCost())}</td>
                  </tr>
                  
              </tbody>
          </table>
          <section>
             
             
          <p style={{fontWeight:700, fontSize:'13px',color:'black',
    verticalAlign: 'bottom', whiteSpace:'pre-line'}}><strong>{company && company.invoice_footer_one}</strong></p>
                <p style={{fontWeight:700, fontSize:'14px', color:'black',
    verticalAlign: 'bottom'}}>Terms and Condition!</p>
                <p style={{fontWeight:700, fontSize:'12px', color:'black',
    verticalAlign: 'bottom',  whiteSpace:'pre-line'}}>

                  {company && company.invoice_footer_two}
                </p>
          </section>
          <table>
                <tr style={{marginBottom:'10px'}}>
                  <td colSpan={3}>________________</td>
                 
                
                </tr>
                <tr>
                  <td><span style={{fontSize:10,paddingLeft:10, color:'black'}}>Customer Signature</span></td>
                </tr>
              </table>
         
      </body>
        }
      </div>

    );
  }
}
export default Invoice;