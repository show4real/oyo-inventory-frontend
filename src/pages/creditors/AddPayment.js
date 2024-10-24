import React, { Component } from "react";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import { addPayment, getClients } from "../../services/creditorService";
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
import { CardHeader, Media, Input, Modal } from "reactstrap";
import { InputNumber } from 'antd';
export class AddPayment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      payments: props.payments,
      creditor: props.creditor,
      total_amount: '',
      previous_payment: '',
      balance: '',
      page: 1,
      rows: 10,
      loading: false,
      address: "",
      phone: "",
      email: "",
      name: "",
      company_name: '',
      payment_mode:'',
      description: ''
    };
  }
  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  componentDidMount() {

  }

  formatCurrency(x) {
    if (x !== null && x !== '0' && x !== undefined) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${parts.join(".")}`;
    }
    return '0';
  }



  onSavePayment = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { amount_paid, payment_mode, validation } = this.state;
    await this.setState({
      validation: {
        ...validation,
        amount_paid: amount_paid !== "",
        payment_mode: payment_mode !== "",

      },
    });
    if (Object.values(this.state.validation).every(Boolean)) {
      this.savePayment();
    } else {
      const errors = Object.keys(this.state.validation).filter((id) => {
        return !this.state.validation[id];
      });
      //await toast.configure({hideProgressBar: true, closeButton: false});
      toast.dismiss();
      toast.configure({ hideProgressBar: true, closeButton: false });
      toast(
        <div style={{ padding: "10px 20px" }}>
          <p style={{ margin: 0, fontWeight: "bold", color: "red" }}>Errors:</p>
          {errors.map((v) => (
            <p key={v} style={{ margin: 0, fontSize: 14, color: "red" }}>
              * {this.validationRules(v)}
            </p>
          ))}
        </div>
      )

    }
  };




  validationRules = (field) => {
    if (field === "amount_paid") {
      return "Amount received field is required";
    } else if (field === "payment_mode"){
      return "Payment Mode is required";
    }
  };

  savePayment = () => {
    this.setState({ saving: true });

    const { creditor, amount_paid, payment_mode, description,  total_amount, previous_payment } = this.state;


    console.log(payment_mode);
    addPayment({
      creditor_id: creditor.id,
      total_amount: creditor.amount,
      previous_payment: creditor.amount_paid,
      amount_paid: amount_paid,
      payment_mode: payment_mode,
      description: description,
    }).then(
      (res) => {
        console.log(res);
        this.setState({ saving: false });
        this.props.toggle();
        this.props.saved();
        this.showToast("Payment saved");

      }).catch((err) => {
        console.log(err);
        this.setState({
          errorMessage: err,
          show: true,
        });
        if (this.state.errorMessage) {
          this.showToast(this.state.errorMessage);
        }
        this.setState({ saving: false });
      });
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20 }}>{msg}</div>);
  };

  render() {
    const { addPayment, creditor, toggle } = this.props;
    const {
      creditor_id,
      amount,
      saving,
      validation,
      loading,
    } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={addPayment}
          toggle={() => !loading && toggle}
        >
          {loading && <SpinDiv text={"loading..."} />}
          {saving && <SpinDiv text={"saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <h5>New Payment </h5>
            </div>

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
                <Col md={6} className="mb-3">
                  <Form.Group id="Name">
                    <Form.Label>Amount Paid</Form.Label>
                    <InputNumber

                      style={{ width: 200, height: 40, paddingTop: 5, borderRadius: 5, fontSize: 18 }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}

                      onChange={e => this.onChange(e, 'amount_paid')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} style={{ marginBottom: 20, }}>
                  <Form.Group className="mb-2">
                    <Form.Label>Mode of Payment</Form.Label>

                    <Form.Select
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "payment_mode");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                      
                    >
                      <option value="">Select Mode of Payment</option>
                      <option value="cash">Cash</option>
                      <option value="transfer">Transfer</option>
                      
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group id="Name">
                    <Form.Label>Description</Form.Label>
                    <Input

                      style={{ width: 200, height: 140, paddingTop: 5, borderRadius: 5, fontSize: 18 }}
                      type='textarea'
                      placeholder=""
                      onChange={e => this.onChange(e.target.value, 'description')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group id="phone">
                    <Form.Label>Amount </Form.Label>
                    <Form.Control
                      required
                      type="number"
                      disabled
                      value={creditor.amount}
                    />
                  </Form.Group>
                </Col>

              </Row>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group id="phone">
                    <Form.Label>Previous Payment Total</Form.Label>
                    <Form.Control
                      required
                      type="number"
                      disabled
                      value={creditor.total_payment}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group id="lastName">
                    <Form.Label>Balance</Form.Label>
                    <Form.Control
                      required
                      disabled
                      type="text"
                      value={creditor.total_balance}
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
                      onClick={this.onSavePayment}
                    >
                      Save Payment
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

export default AddPayment;
