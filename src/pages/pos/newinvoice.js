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
import { faEnvelope, faGlobe, faMap, faPhone, faVoicemail } from '@fortawesome/free-solid-svg-icons';
import { addCompanyProfile, getCompany } from "../../services/companyService"
import  {toWords} from "../../services/numberWordService"
import './style2.css'

export class Invoice extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      search: "",
      company: JSON.parse(localStorage.getItem('company')) || null,
      loading: false,
      saving: false,
    };
  }
  

  totalCost = () => {
    const { cart_details } = this.props;

    var total = 0;
    for (let v = 0; v < cart_details.length; v++) {
      total += cart_details[v].order.unit_selling_price * cart_details[v].qty_sold;
    }
    return total;
  };

  getWords(amount){
    return toWords(amount)
  }

  

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
      return <span></span>
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
    if (x !== null && x !== 0) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${y}${parts.join(".")}`;
    }
    return 0;
  }

  render() {
    const { cart_details, transaction_id, payment_mode, sold_at, company } = this.props;

    return (
       
        
        <body>
            <div class="my-5 page" size="A4">
                <div class="p-5">
                    <section class="top-content bb d-flex justify-content-between">
                        <div class="logo">
                            <img src="logo.png" alt="" class="img-fluid"/>
                        </div>
                        <div class="top-left">
                            <div class="graphic-path">
                                <p>Invoice</p>
                            </div>
                            <div class="position-relative">
                                <p>Transanction No. <span>{transaction_id}</span></p>
                            </div>
                        </div>
                    </section>
        
                    <section class="store-user mt-5">
                        <div class="col-10">
                            <div class="row bb pb-3">
                                <div class="col-7">
                                    <p>Supplier,</p>
                                    <h2 style="font-weight: 800;">{company.name}</h2>
                                    <p class="address"> { company.address} <br/>  <span><FontAwesomeIcon icon={faPhone} /> 
                                    {company.phone_one}, &nbsp;{company.phone_two}</span></p>
                                    <div class="txn mt-2">TXN: XXXXXXX</div>
                                </div>
                                {/* <div class="col-5">
                                    <p>Client,</p>
                                    <h2>Sabur Ali</h2>
                                    <p class="address"> 777 Brockton Avenue, <br/> Abington MA 2351, <br/>Vestavia Hills AL </p>
                                    <div class="txn mt-2">TXN: XXXXXXX</div>
                                </div> */}
                            </div>
                            <div class="row extra-info pt-3">
                                <div class="col-7">
                                    <p>Payment Method: <span> {payment_mode}</span></p>
                                    <p>Order Number: <span>{transaction_id}</span></p>
                                </div>
                                <div class="col-5">
                                    <p>Deliver Date: {moment(sold_at).format('MMM D, YYYY')}</p>
                                </div>
                            </div>
                        </div>
                    </section>
        
                    <section class="product-area mt-4">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <td>Item Description</td>
                                    <td>Serial No</td>
                                    <td>Price</td>
                                    <td>Quantity</td>
                                    <td>Total</td>
                                </tr>
                            </thead>
                            <tbody>
                            {Object.keys(cart_details).length !== 0 ? cart_details.map((item, key) => {
                                return (
                                    <tr>
                                        <td>
                                            <div class="media">
                                                <img class="mr-3 img-fluid" src="mobile.jpg" alt="Product 01"/>
                                                <div class="media-body">
                                                    <p class="mt-0 title">{item.order.product_name} <br/>
                                                        {this.attributeCols(
                                                            JSON.parse(item.order.product_attributes),
                                                            JSON.parse(item.order.product_attributes_keys)
                                                        )}<br/>  
                                                    </p>
                                                
                                                </div>
                                            </div>
                                        </td>
                                        {company.sell_by_serial_no == 1 && <td>
                                            {item.sold_serials && item.sold_serials.map((p)=>{
                                            return <p>{p.serial_no}</p>
                                        })}
                                        </td>}
                                        <td> {this.formatCurrency2(item.order.unit_selling_price)}</td>
                                        <td>{item.qty_sold}</td>
                                        <td>{this.formatCurrency2(item.order.unit_selling_price*item.qty_sold)}</td>
                                    </tr>
                                )
                            }):''}
                                
                                
                            </tbody>
                        </table>
                    </section>
        
                    <section class="balance-info">
                        <div class="row">
                            
                            <div class="col-4">
                                <table class="table border-0 table-hover">
                                    <tr>
                                        <td>Sub Total:</td>
                                        <td>{company.currency}{this.formatCurrency2(this.totalCost())}</td>
                                    </tr>
                                    {/* <tr>
                                        <td>Tax:</td>
                                        <td>15$</td>
                                    </tr>
                                    <tr>
                                        <td>Deliver:</td>
                                        <td>10$</td>
                                    </tr> */}
                                    <tfoot>
                                        <tr>
                                            <td>Total:</td>
                                            <td>{company.currency}{this.formatCurrency2(this.totalCost())}</td>
                                        </tr>
                                    </tfoot>
                                    <div class="col-8">
                                        <p class="m-0 font-weight-bold"> Terms and Condition </p>
                                        <p> {company && company.invoice_footer_two}</p>
                                    </div>
                                </table>
        
                             
                                <div class="col-6">
                                    <img src="signature.png" class="img-fluid" alt="" />
                                    <p class="text-center m-0"> Cashier Signature </p>
                                </div>
                                <div class="col-6">
                                    <img src="signature.png" class="img-fluid" alt="" />
                                    <p class="text-center m-0"> Customer Signature </p>
                                </div>
                                <div style="margin-top: 100px;">
        
                                </div>
                            </div>
                        </div>
                    </section>
        
                   
                    <img src="cart.jpg" class="img-fluid cart-bg" alt="" />
        
                    <footer >
                        <hr />
                       
                        <div class="social pt-3">
                            <span class="pr-2">
                                <i class="fas fa-mobile-alt"></i>
                                <span> {company.phone_one}, &nbsp;{company.phone_two}</span>
                            </span>
                            <span class="pr-2">
                                <i class="fas fa-envelope"></i>
                                <span>{company.website}</span>
                            </span>
                            <span class="pr-2">
                                <i class="fab fa-facebook-f"></i>
                                <span> {company && company.invoice_header}</span>
                            </span>
                            {/* <span class="pr-2">
                                <i class="fab fa-youtube"></i>
                                <span>/abdussabur</span>
                            </span>
                            <span class="pr-2">
                                <i class="fab fa-github"></i>
                                <span>/example</span>
                            </span> */}
                        </div>
                    </footer>
                </div>
            </div>
        
        
        
        
        
        
        
        
        
        
        </body>

    );
  }
  }

export default Invoice;