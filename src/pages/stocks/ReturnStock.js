import React, { Component } from "react";
import { CardHeader, Media, Input, Modal } from "reactstrap";
import {
  Col,
  Row,
  Nav,
  Card,
  Table,
  Form,
 
  ButtonGroup,
  Breadcrumb,
  InputGroup,
  Dropdown,
} from "@themesberg/react-bootstrap";
import { Button } from "antd";
import "@pathofdev/react-tag-input/build/index.css";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";

import moment from "moment";
import Select from 'react-select';
import { getSerialNos } from "../../services/stockService";
import { returnStock } from "../../services/stockService";


export class ReturnStock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stock: props.serial,
      loading: false,
      search: "",
      validation: {},
      quantity_returned:'',
      stock_id:props.serial.id,
      stock_serial:[],
      selectedSerials:[],
      fromdate: moment().startOf('month'),
      todate: moment().endOf('day'),
      submitted:false,
      company:JSON.parse(localStorage.getItem('company')),
    };
  }

  componentDidMount() {
    toast.configure({ hideProgressBar: true, closeButton: false });
    this.getSerialNos()
  
  }

 

  handleInputChange = (selectedSerials) => {
    this.setState({ selectedSerials });
    console.log(this.state.selectedSerials)
  }

  selectQuantity = (stock) => {
    let options = [];
    for (let i = 1; i <= stock; i++) {

      options.push(
        <option value={i} key={i}>
          {i}
        </option>
      );
    }
    return options;
  };


  

  onReturnStock = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { selectedSerials, company, quantity_returned } = this.state;
    this.setState({submitted:true})
    if(company.sell_by_serial_no == 1){
     
      const check_serials= selectedSerials.length > 0 ? false :true;
  
      if (!check_serials) {
        this.updateStock();
      }
    }
    if(quantity_returned !== ''){
      this.updateStock();
    }
   
  };

  
  
  getSerialNos = () => {
    this.setState({loading:true})
    const {stock_id}= this.state;
    getSerialNos({stock_id}).then(
      (res) => {
        this.setState({
          loading: false,
       
          stock_serials: res.stock_serials.filter(serial => serial.sold_at === null).map((opt) => ({
            label: opt.serial_no || 'No Serial Number',
            value: opt.id,
          })) || [],
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
      
    );

    }

    showToast = (msg) => {
      toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
    };
  

   

  

  updateStock = () => {
    this.setState({ loading: true });
    const {selectedSerials, quantity_returned}= this.state;

      const { stock_id } = this.state;
      console.log(selectedSerials)
        returnStock({ selectedSerials, quantity_returned, stock_id }).then(
            (res) => {
              console.log(res);
              this.setState({ loading: false });
              this.props.toggle();
              this.showToast("Stock Returned");
            },
            (error) => {
              console.log(error);
              if (error) {
                toast.error("Stock cannot be returned");
              }
              this.setState({ loading: false });
            }
          );
   
    
  };
 

  render() {
    const { serial, toggle } = this.props;

    const { saving, submitted, company, selectedSerials, stock_serials,quantity_returned,loading, stock } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={serial != null}
          toggle={() => !loading && !saving && toggle}
        >
          {loading && <SpinDiv text={"Loading..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            
            <h3 className="modal-title" id="exampleModalLabel">
              Return Order {stock.tracking}
            </h3>
           
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
               {company.sell_by_serial_no == 1 ? <Col md={10}>
                  
                  <Form.Group>
                    <Form.Label>Select Products to be Returned</Form.Label>
                
                      <Select
                        
                        onChange={this.handleInputChange}
                        options={stock_serials}
                        isMulti

                      />
                        
                    </Form.Group>
                    {submitted && selectedSerials.length < 1 && (
                    <div style={{ color: "red" }}>Product to be Returned is Required</div>
                    )}

                </Col> : <Col md={10}>
                  <Form.Group className="mb-2">
                    <Form.Select
                      required
                      onChange={(e) => {
                        this.onChange(e.target.value, "quantity_returned");
                      }}
                      style={{
                        marginRight: 10,
                        width: "60%",
                      }}
                    >
                      <option value="">Select Quantity to Returned</option>
                      {this.selectQuantity(stock.in_stock)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                }
                   
                    
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
                      onClick={this.onReturnStock}
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

export default ReturnStock;
