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
import { getSerialNos, returnOrder } from "../../services/purchaseOrderService";



export class ReturnOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      purhase_order: props.serial,
      loading: false,
      search: "",
      validation: {},
      quantity_returned:'',
      purchase_order_id:props.serial,
      purhase_order_serial:[],
      selectedSerials:[],
      fromdate: moment().startOf('month'),
      todate: moment().endOf('day'),
      submitted:false,
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


  

  onReturnOrder = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { selectedSerials } = this.state;
    this.setState({submitted:true})
    const check_serials= selectedSerials.length > 0 ? false :true;

    if (!check_serials) {
      this.updateOrder();
    } else {
      
    }
  };

  
  
  getSerialNos = () => {
    this.setState({loading:true})
    const {purchase_order_id}= this.state;
    getSerialNos({purchase_order_id}).then(
      (res) => {
        this.setState({
          loading: false,
       
          purchase_order_serials: res.purchase_order_serials.filter(serial => serial.moved_at === null).map((opt) => ({
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
  

   

  

  updateOrder = () => {
    this.setState({ loading: true });
    const {selectedSerials}= this.state;

      const { purchase_order_id } = this.state;
    
        const quantity_returned = selectedSerials.length
        returnOrder({ 
          purchase_order_serials:selectedSerials, 
          purchase_order_id:purchase_order_id, 
          id:purchase_order_id,
          quantity_returned:quantity_returned  }).then(
            (res) => {
              console.log(res);
              this.setState({ loading: false });
              this.props.saved();
              this.props.toggle();
              this.showToast("Purchase Order Returned");
            },
            (error) => {
              console.log(error);
              if (error) {
                toast.error("Purchase Order cannot be returned");
              }
              this.setState({ loading: false });
            }
          );
   
    
  };
 

  render() {
    const { serial, toggle } = this.props;

    const { saving, submitted, selectedSerials, purchase_order_serials,quantity_returned,loading, purhase_order } = this.state;
    {console.log(purchase_order_serials)}
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={serial != null}
          toggle={() => !loading && !saving && toggle}
        >
          {loading && <SpinDiv text={"Loading..."} />}
          {saving && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            
            <h3 className="modal-title" id="exampleModalLabel">
              Return Order {purhase_order.tracking}
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
                <Col md={8}>
                  
                  <Form.Group>
                    <Form.Label>Select Products to be Returned</Form.Label>
                
                      <Select
                        
                        onChange={this.handleInputChange}
                        options={purchase_order_serials}
                        isMulti

                      />
                        
                    </Form.Group>
                    {submitted && selectedSerials.length < 1 && (
                    <div style={{ color: "red" }}>Product to be Returned is Required</div>
                    )}

                </Col>
                
                   
                    
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
                      onClick={this.onReturnOrder}
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

export default ReturnOrder;
