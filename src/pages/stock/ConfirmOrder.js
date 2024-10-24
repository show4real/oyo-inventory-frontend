import React, { Component } from "react";
import { CardHeader, Media, Input, Modal } from "reactstrap";
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
import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import { confirmOrder,returnOrder, moveOrder } from "../../services/purchaseOrderService";
import { formatCurrency,format } from "../../services/formatCurrencyService";
import CurrencyInput from 'react-currency-input-field';

import ReactDatetime from "react-datetime";
import moment from "moment";
import { AsyncPaginate } from "react-select-async-paginate";

export class ConfirmOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stock: props.confirmOrder,
      branches:props.branches.data.map((opt) => ({
        label: opt.name,
        value: opt.id,
      })),
      loading: false,
      search: "",
      validation: {},
      branch_id:'',
      quantity_moved:'',
      quantity_returned:'',
      name: "",
      received_at:'',
      selling_price:'',
    
      fromdate: moment().startOf('month'),
      todate: moment().endOf('day'),
    };
  }

  componentDidMount() {
    toast.configure({ hideProgressBar: true, closeButton: false });
    console.log(this.state.stock);
    //this.filter()
  }

  selectQuantity=(instock)=>{
    let text = [];
    for (let i = 1; i <= instock; i++) {
      text.push(<option value={i} key={i}>{i}</option>);

    }
    return text;
    
  }

  formatNumber=(number)=>{
    return format(number);
  }

  
  formatC=(x)=>{
    return formatCurrency(x)
  }

  onConfirmOrder = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { stock, validation, selling_price, branch_id, quantity_moved, quantity_returned,received_at  } = this.state;
    const { id } = stock;
    if(stock.confirm === 1){
      await this.setState({
        validation: {
          ...validation,
          received_at: received_at !== "",
          selling_price: selling_price !== "",

        },
  
      });

    } else if(stock.move ===1){
      await this.setState({
        validation: {
          ...validation,
          branch_id: branch_id !== "",
          quantity_moved:quantity_moved !== "",
        },
  
      });

    } else if (stock.return == 1){
      await this.setState({
        validation: {
          ...validation,
          //branch_id: branch_id !== "",
          quantity_returned:quantity_returned !== "",
        },
      })
    }
    
    if (Object.values(this.state.validation).every(Boolean)) {
      this.updateStock();
    } else {
      const errors = Object.keys(this.state.validation).filter((id) => {
        return !this.state.validation[id];
      });
      //await toast.configure({hideProgressBar: true, closeButton: false});
      await setTimeout(
        () =>
          toast.error(
            <div style={{ padding: "10px 20px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Errors:</p>
              {errors.map((v) => (
                <p key={v} style={{ margin: 0, fontSize: 14 }}>
                  * {this.validationRules(v)}
                </p>
              ))}
            </div>
          ),
        250
      );
    }
  };

  loadOptions = async (search, prevOptions) => {
    //await this.sleep(1000);

    let filteredOptions;
    if (!search) {
      filteredOptions = this.state.branches;
    } else {
      const searchLower = search.toLowerCase();

      filteredOptions = this.state.branches.filter(({ label }) =>
        label.toLowerCase().includes(searchLower)
      );
    }

    const hasMore = filteredOptions.length > prevOptions.length + 10;
    const slicedOptions = filteredOptions.slice(
      prevOptions.length,
      prevOptions.length + 10
    );

    return {
      options: slicedOptions,
      hasMore
    };
  };


  validationRules = (field) => {
    if (field === "received_at") {
      return "Date Received is required";
    }else if (field === "selling_price") {
        return "Selling price is required";
      } else if (field === "branch_id") {
        return "Branch is required";
      } else if (field === "quantity_moved") {
        return "Quantity moved is required";
      } else if (field === "quantity_returned"){
        return "Quantity Returned is required"
      }
  };
  

  stripComma=(a)=>{
    a=a.replace(/\,/g,'');
    a=parseInt(a,10);
    return a;
  }

  updateStock = () => {
    this.setState({ loading: true });
    if(this.state.stock.cancel == 1){
        const received_at='';
        const {id}=this.state.stock;
        confirmOrder({ received_at, id }).then(
            (res) => {
              console.log(res);
              this.setState({ loading: false });
              this.props.saved();
              this.props.toggle();
              this.showToast(res.status==='Rejected'?'Order Rejected':'Order Confirmed');
            },
            (error) => {
              console.log(error);
              if (error) {
                toast.error("Order cannot be confirmed");
              }
              this.setState({ loading: false });
            }
          );
    }else if(this.state.stock.return == 1){
      const {quantity_returned}= this.state;
      const { id } = this.state.stock;
      
        returnOrder({ quantity_returned, id }).then(
            (res) => {
              console.log(res);
              this.setState({ loading: false });
              this.props.saved();
              this.props.toggle();
              this.showToast("Order Returned");
            },
            (error) => {
              console.log(error);
              if (error) {
                toast.error("Order cannot be returned");
              }
              this.setState({ loading: false });
            }
          );
    }else if(this.state.stock.move == 1){
      const {branch_id, quantity_moved}= this.state;
      const {id, product_id } = this.state.stock;
    
        moveOrder({ quantity_moved, product_id, branch_id, id }).then(
          (res) => {
            console.log(res);
            this.setState({ loading: false });
            this.props.saved();
            this.props.toggle();
            this.showToast("Order Moved");
          },
          (error) => {
            console.log(error);
            if (error) {
              toast.error("Order cannot be returned");
            }
            this.setState({ loading: false });
          }
        );
      
        
    }else{
        const {received_at,selling_price,} =this.state;
        const { id } = this.state.stock;
        console.log(received_at);
        confirmOrder({ received_at,selling_price, id }).then(
            (res) => {
              console.log(res);
              this.setState({ loading: false });
              this.props.saved();
              this.props.toggle();
              this.showToast("Order Confirmed");
            },
            (error) => {
              console.log(error);
              if (error) {
                toast.error("Order cannot be confirmed");
              }
              this.setState({ loading: false });
            }
          );
    }
   
    
  };
  handleBranchChange = (branch) => {
    this.setState({ branch_id: branch.value });

  }
  

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  };

 

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };


  

  render() {
    const { confirmOrder, toggle } = this.props;

    const { saving,quantity_returned,selling_price, quantity_moved,branches, received_at, fromdate, todate,loading, stock } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={confirmOrder != null}
          toggle={() => !loading && !saving && toggle}
        >
          {loading && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            {stock.cancel == 1 ?
              <h3 className="modal-title" id="exampleModalLabel">
                Cancel Order {stock.tracking_id}
              </h3>: ''
            }
            {stock.return ==1 ?<h3 className="modal-title" id="exampleModalLabel">
              Return Order {stock.tracking_id}
            </h3>: ''}
            {stock.confirm == 1 ? <h3 className="modal-title" id="exampleModalLabel">
              Confirm Order {stock.tracking_id}
            </h3>: ''}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={toggle}
            ></button>
          </div>
          <Card border="light" className="shadow-sm mb-4">
            <Card.Body className="pb-0">
              <Row>
                <Col md={12} className="mb-3">
                
                  {stock.confirm == 1 ? 
                      <Row>
                          <Col md={12} className="mb-3">
                            <Form.Group>
                            <Form.Label>Unit Selling Price</Form.Label>
                            </Form.Group>
                      <Form.Group id="lastName">
                        <Form.Label>  Cost Price {this.formatC(stock.unit_price)}<br/></Form.Label>
                        

                        <Input
                          id="input-example"
                          name="input-name"
                          className="form-control"
                          placeholder="Unit Selling price"
                          value={selling_price}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "selling_price");
                          }}
                          
                        />

                      
                      </Form.Group>
                    </Col>
                    <Row>
                        <Col md={12}>
                        <Form.Group id="firstName">
                      <Form.Label>Date Received {stock.tracking_id}</Form.Label>
                   
                      <ReactDatetime
                        value={received_at}
                        dateFormat={"MMM DD, YYYY"}
                        closeOnSelect
                        onChange={(e) => this.onChange(e, "received_at")}
                        inputProps={{
                          required: true,
                          className: "form-control date-width",
                        }}
                        timeFormat={false}
                        isValidDate={(current)=>{return (current.isSame(todate)||current.isAfter(todate))&&current.isAfter(moment());}}
                      />
                    </Form.Group>
                        </Col>
                    </Row>
                      </Row>
                    
                  : 
                    ''
                  }
                  {stock.cancel==1 ? <div
                      className="modal-body"
                      style={{ border: "1px solid #eee" }}
                    >
                        <div style={{display:"none"}}>
                        
                        </div>
                      Are you sure you want to reject this order? <br />
                      
                      <br />
                    </div>:''}
                    {stock.return ==1 ? <div
                      className="modal-body"
                      style={{ border: "1px solid #eee" }}
                    >
                        <div style={{display:"none"}}>
                        
                        </div>
                      Are you sure you want to return this order? <br />
                      
                      <br />
                      
                      <Form.Group className="mb-2">
                      <Form.Select
                       value={quantity_returned}
                       onChange={(e) => {
                         this.onChange(e.target.value, "quantity_returned");
                       }}
                      style={{
                        marginRight: 10,
                        width: "40%",
                      }}
                    >
                      <option value="">Select Quantity</option>
                      {this.selectQuantity(stock.in_stock)}
                     
                    </Form.Select></Form.Group>
                      
                    </div>:''}
                    {stock.move ==1 ? <div
                      className="modal-body"
                      style={{ border: "1px solid #eee" }}
                    >
                        <div style={{display:"none"}}>
                        
                        </div>
                       <h5>Move Order, Specify Quantity and Branch</h5> <br />
                      
                      <br />
                      <Form.Group className="mb-2">
                        <Form.Label>Branches</Form.Label>
                        <AsyncPaginate
                          onChange={this.handleBranchChange}
                          loadOptions={this.loadOptions}
                        />


                      </Form.Group>
                      <Form.Group className="mb-2">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Select
                       value={quantity_moved}
                       onChange={(e) => {
                         this.onChange(e.target.value, "quantity_moved");
                       }}
                     
                    >
                      <option value="">Select Quantity</option>
                      {this.selectQuantity(stock.in_stock)}
                     
                    </Form.Select></Form.Group>
                      
                    </div>:''}
                </Col>
              </Row>
              <Row style={{ marginTop: "10px" }}>
                <Col md={12}>
                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ marginTop: "10px", float: "right" }}
                      disabled={saving}
                      onClick={this.onConfirmOrder}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="transparent"
                      data-dismiss="modal"
                      type="button"
                      disabled={saving}
                      style={{ marginTop: "10px", float: "right" }}
                      onClick={toggle}
                    >
                      {" "}
                      Close
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Modal>
      </>
    );
  }
}

export default ConfirmOrder;
