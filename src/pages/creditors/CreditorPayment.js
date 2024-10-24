import React, { Component } from "react";
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
import { FormGroup, CardHeader, Media, Input, Modal } from "reactstrap";
import Select from 'react-select';
import { faEnvelope, faPhone, faLock, faPencilAlt, faAddressCard, faUnlockAlt, faEyeSlash, faEye, faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import AddPayment from "./AddPayment";
import EditPayment from "./EditPayment";
import ReactDatetime from "react-datetime";
import moment from "moment";
import { getCreditor } from "../../services/creditorService";

import ReactToPrint from "react-to-print";
import { InputNumber } from 'antd';


export class CreditorPayment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      search: '',
      validation: {},
      show: false,
      edit: false,
      submitted: false,
      creditor: [],
      payments: [],
      user: JSON.parse(localStorage.getItem('user')),
      total_amount: 0,
      previous_payment: 0,
      balance: 0,
        id: props.match.params.id,
      hideNav: false

    };
  }

  async componentDidMount() {
    toast.configure({ hideProgressBar: true, closeButton: false });
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
    await this.getCreditor()

  }

  resize() {
    this.setState({ hideNav: window.innerWidth <= 760 });
  }

  
  componentWillUnmount() {
    window.removeEventListener("resize", this.resize.bind(this));
  }



  

  onChange = (e, state) => {
    const { creditor } = this.state

    this.setState({ creditor: { ...creditor, [state]: e } })
  }

  toggleEditPayment = (payment) => {
    this.setState({ payment });
    this.getCreditor();


  };

  


  showToast = msg => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  }
  showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "white" }}>{msg}</div>);
  };


  toggleEdit = () => {
    this.setState({ edit: !this.state.edit });
  };

  getCreditor = async () => {
    const { id } = this.state;
    this.setState({ loading: true })
    await getCreditor(id).then(

      (res) => {    
        this.setState({
          creditor: res.creditor,
          payments: res.payments,
          loading: false,
          edit: false
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };


  toggleAddPayment = () => {
    this.setState({ addPayment: !this.state.addPayment });
  };


  formatCurrency(x) {
    if (x !== null && x !== 0 && x !== undefined) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `NGN ${parts.join(".")}`;
    }
    return '0';
  }

 




  render() {

    const { saving, hideNav, addPayment, user, payment, edit, items, payments, loading, creditor } = this.state;
    return (
      <>
              
        {addPayment && (
          <AddPayment
            saved={this.getCreditor}
            addPayment={addPayment}
            payments={payments}
            creditor={creditor}
            toggle={() => this.setState({ addPayment: null })}
          />
        )}

        {payment && (
          <EditPayment
            saved={this.getCreditor}
            payment={payment}
            payments={payments}
            creditor={creditor}
            toggle={() => this.setState({ payment: null })}
          />
        )}
        <Row style={{}}>
          <Col lg="12">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
              <div className="d-block mb-4 mb-md-0">
                <Breadcrumb
                  listProps={{
                    className: " breadcrumb-text-dark text-primary",
                  }}
                >
                  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                  <Breadcrumb.Item href="/creditors">Creditors</Breadcrumb.Item>
                  <Breadcrumb.Item href="#">Payments</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                {!hideNav && <ButtonGroup>
                  {(user.admin === 1) && (
                    <Button variant="outline-primary" size="sm" onClick={() => this.toggleAddPayment()}>
                      + New Payment

                    </Button>
                  )}

                 
                </ButtonGroup>}

              </div>
            </div>
          </Col>
        </Row>
        <Card border="light" className="shadow-sm mb-4">
          <Card.Body className="pb-0">
            <Row>
              <Row>
                <Col md={10}>

                  <Row style={{ marginBottom: 20 }}>
                    <Col md={2}>
                     
                    </Col>
                    <Col md={4} style={{ fontSize: 20, fontWeight: 'bold' }}>
                      Amount :{this.formatCurrency(creditor.amount)}
                    </Col>


                    <Col md={3} style={{ fontSize: 20, fontWeight: 'bold' }}>
                      Paid:{this.formatCurrency(creditor.total_payment)}
                    </Col>
                    <Col md={3} style={{ fontSize: 20, fontWeight: 'bold' }}>
                      Balance:{this.formatCurrency(creditor.total_balance)}
                    </Col>




                  </Row>
                 
                  
                </Col>
              </Row>

              {hideNav === true ? <Row style={{ border: '1px #eee solid', padding: '10px 5px 0px', margin: '15px 2px', borderRadius: 7 }}>
                <Form.Label style={{ fontSize: 25 }}>Payments Breakdown</Form.Label>
                {payments.map((payment, key) => {

                  return (
                    <Col md={12} style={{ border: '1px #eee solid', padding: '10px 5px 0px 10px', margin: '15px 10px 0px 10px', borderRadius: 7 }}>
                      <Row style={{ margin: '10px 10px 0px 10px' }}>
                        <Form.Label style={{ fontSize: 20 }}>{this.ordinal(key + 1)} Payments</Form.Label>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Supplier</Form.Label>
                            <Input
                              value={creditor.supplier_name}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Product</Form.Label>
                            <Input
                              value={creditor.product_name}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Purchase Order ID</Form.Label>
                            <Input
                              value={creditor.tracking}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Amount</Form.Label>
                            <Input
                              value={`${this.formatCurrency(payment.amount)}`}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Paid</Form.Label>
                            <Input
                              value={`${this.formatCurrency(payment.amount_paid)}`}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Transaction Date</Form.Label>
                            <Input
                              value={moment(payment.created_at).format('MMM DD YYYY')}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12} style={{ marginTop: 10, marginBottom: 20 }}>
                          <ButtonGroup>
                            {((user.admin === 1) && payments.length >= 1) && (

                              <Button
                                variant="outline-primary"
                                onClick={() => this.toggleEditPayment(payment)}
                                size="md"
                              >
                                Edit
                              </Button>
                            )}



                          </ButtonGroup>
                        </Col>


                      </Row>
                    </Col>
                  )
                }
                )}

              </Row>
                : <Row>
                  <h5 style={{ fontWeight: 'bold', marginTop: 15 }}>Payments</h5>
                  <Table
                    responsive
                    className="table-centered table-nowrap rounded mb-0"
                  >
                    <thead className="thead-light">
                      <tr>
                        <th className="border-0">Supplier</th>
                        <th className="border-0">Product</th>
                        <th className="border-0">Purchase Order</th>
                        <th className="border-0">Amount</th>
                        <th className="border-0">Paid</th>
                        <th className="border-0">Transaction Date</th>
                      </tr>
                    </thead>
                    <tbody>
                        {console.log(creditor)}
                      {payments .map((payment, key) => {

                        return (
                          <tr style={{ fontWeight: "bold" }}>

                            <td >{creditor.supplier_name}</td>
                            <td >{creditor.product_name}</td>
                            <td >{creditor.tracking}</td>
                            <td >{this.formatCurrency(payment.amount)}</td>
                            <td >{this.formatCurrency(payment.amount_paid)}</td>
                            <td>{moment(payment.created_at).format('MMM DD YYYY')}</td>

                            <td>
                              <ButtonGroup>
                                {((user.admin === 1) && payments.length >= 1) && (

                                  <Button
                                    variant="outline-primary"
                                    onClick={() => this.toggleEditPayment(payment)}
                                    size="md"
                                  >
                                    Edit
                                  </Button>
                                )}



                              </ButtonGroup>
                            </td>

                          </tr>
                        );
                      })}
                      <tr style={{ fontWeight: "bold" }}>
                        <td colSpan={2}></td>
                        <td>  Total Payments:{this.formatCurrency(creditor.total_payment)}</td>
                        <td>  Balance:{this.formatCurrency(creditor.total_balance)}</td>
                      </tr>
                    </tbody>

                  </Table>
                </Row>

              }


            </Row>


          </Card.Body>
        </Card>
      </>
    );
  }
}

export default CreditorPayment;
