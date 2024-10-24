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
import { faEnvelope, faPhone, faLock, faPencilAlt, faAddressCard, faTimes, faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@pathofdev/react-tag-input/build/index.css";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import moment from "moment";
import { AsyncPaginate } from "react-select-async-paginate";
import { moveOrder } from "../../services/purchaseOrderService";


export class ConfirmOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
        orders: this.props.movedOrder,
        branches: this.props.branches.map((branch)=>({
            label:branch.name,
            value:branch.id
        })),
        id: this.props.id,
        branch_id:'',
    };
  }

  componentDidMount() {
    toast.configure({ hideProgressBar: true, closeButton: false });
  
  }

  
  onMoveOrder = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const {validation, id,orders, branch_id  } = this.state;
   
    console.log(branch_id)
    if (branch_id != '' && orders.length > 0 ) {
      this.moveOrder();
    } else {
    
      await setTimeout(
        () =>
          toast.error(
            <div style={{ padding: "10px 20px" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Errors: Branch is Required<br/> Ensure Order is Available</p>
              

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
     if (field === "branch_id") {
        return "Branch is required";
      } 
  };
  

  stripComma=(a)=>{
    a=a.replace(/\,/g,'');
    a=parseInt(a,10);
    return a;
  }

  moveOrder = () => {
    this.setState({ loading: true })
    const {orders, branch_id, id} = this.state;

    const quantity_moved = orders.length;
    moveOrder({values:orders, branch_id:branch_id,  id:id, quantity_moved:quantity_moved }).then(
        (res) => {
          
          this.setState({ loading: false });
          this.props.saved();
          this.props.toggle();
          this.showToast('Order Moved');
        },
        (error) => {
          console.log(error);
          if (error) {
            toast.error("Order cannot be Moved");
          }
          this.setState({ loading: false });
        }
      );
    
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

  removeFromCart(index) {
    const list = this.state.orders;

    list.splice(index, 1);
    this.setState({ orders: list });
  }


  

  render() {
    const {toggle } = this.props;

    const {orders, saving, branches, loading } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={orders != null}
          toggle={() => !loading && !saving && toggle}
        >
          {loading && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={toggle}
            ></button>
          </div>
          <Card border="light" className="shadow-sm mb-4">
            <Card.Body className="pb-0">
            <Table
                      responsive
                      className="table-centered table-nowrap rounded mb-0"
                    >
                      <thead className="thead-light">
                        <tr>
                          <th className="border-0">S/N</th>

                          <th className="border-0">Product Serial No</th>
                         

                        </tr>
                      </thead>
                      <tbody>
                
                        {orders.map((order, key) => {
                       
                          return (
                            <tr>

                          

                            <td style={{ display: 'none' }}>
                              <Form.Group className="mb-2">
                                <InputGroup>
                                  <InputGroup.Text>
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                  </InputGroup.Text>
                                  <Input

                                    type="text"
                                    disabled
                                    name='stock_id'
                                    value={order.stock_id}
                                    onChange={e => this.handleInputChange(e, key)}
                                  />
                                </InputGroup>
                              </Form.Group>

                            </td>
                            <td style={{ display: 'none' }} >
                              <Form.Group className="mb-2">
                                <InputGroup>
                                  <InputGroup.Text>
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                  </InputGroup.Text>
                                  <Input

                                    type="text"
                                    disabled
                                    name="serial_id"


                                    value={order.id}
                                    onChange={e => this.handleInputChange(e, key)}
                                  />
                                </InputGroup>
                              </Form.Group>

                            </td>
                            <td >

                              <Form.Group className="mb-2">
                                <Form.Label></Form.Label>
                                <InputGroup>
                                  <InputGroup.Text>
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                  </InputGroup.Text>
                                  <Input

                                    type="text"
                                    disabled
                                
                                    value={ key + 1}

                                  />
                                </InputGroup>
                              </Form.Group>

                            </td>
                            <td>
                              <Form.Group className="mb-2">
                                <Form.Label></Form.Label>
                                <InputGroup>
                                  <InputGroup.Text>
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                  </InputGroup.Text>

                                  <Input

                                    type="text"
                                    placeholder={`Serial No`}
                                   
                                    disabled
                                    value={order.serial_no || ''}
                                    onChange={e => this.handleInputChange(e, key)}
                                    name='serial_no'
                                  />
                                </InputGroup>
                              </Form.Group>
                            

                            </td>
                            <td>
                            <Button
                                    size="xs"
                                    style={{
                                      marginLeft: "60px",
                                      backgroundColor: "white",
                                      color: "black",
                                    }}
                                    onClick={() => this.removeFromCart(key)}
                                  >
                                    <i className="fa fa-trash" />
                                  </Button>
                            </td>
                            
                            

                          </tr>
                          )
                        })}
                          
                     

                      </tbody>


                    </Table>
           
              <Row>
                <Col md={12} className="mb-3">

                
                  
                <Form.Group className="mb-2">
                    {console.log(branches)}
                        <Form.Label>Branches</Form.Label>
                        <AsyncPaginate
                          onChange={this.handleBranchChange}
                          loadOptions={this.loadOptions}
                        />


                      </Form.Group>
                      
                
                  
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
                      onClick={this.onMoveOrder}
                    >
                      Move
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
