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
import Select from "react-select";
import {
  faEnvelope,
  faPhone,
  faLock,
  faPencilAlt,
  faAddressCard,
  faUnlockAlt,
  faEyeSlash,
  faEye,
  faLocationArrow,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import axios from "axios";
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";
import AddClient from "../clients/AddClient";
import AddPayment from "./AddPayment";
import EditPayment from "./EditPayment";
import ReactDatetime from "react-datetime";
import moment from "moment";
import {
  getClients,
  getInvoiceId,
  getInvoice,
} from "../../services/invoiceService";
import { currencies } from "./Currency";
import Invoice from "./Invoice";
import Invoice2 from "./Invoice2";
import ReactToPrint from "react-to-print";
import { InputNumber } from "antd";

export class EditInvoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      search: "",
      validation: {},
      show: false,
      edit: false,
      submitted: false,
      invoice: [],
      items: [],
      user: JSON.parse(localStorage.getItem("user")),
      company: JSON.parse(localStorage.getItem("company")),
      pos_items: [],
      payments: [],
      total_amount: 0,
      total_balance: 0,
      previous_payment: 0,
      balance: 0,
      english_ordinal_rules: new Intl.PluralRules("en", { type: "ordinal" }),
      suffixes: { one: "st", two: "nd", few: "rd", other: "th" },

      id: props.match.params.id,
      clients: [],
      currencies: [],
      hideNav: false,
      prev_balance: 0,
    };
  }

  componentDidMount() {
    toast.configure({ hideProgressBar: true, closeButton: false });
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
    this.getInvoice();
    this.getClients();
    this.getBalance();
  }

  resize() {
    this.setState({ hideNav: window.innerWidth <= 760 });
  }

  ordinal(number) {
    const { suffixes, english_ordinal_rules } = this.state;
    const suffix = suffixes[english_ordinal_rules.select(number)];
    return number + suffix;
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resize.bind(this));
  }

  getClients = () => {
    //this.setState({loading:true})

    getClients().then(
      (res) => {
        this.setState({
          clients: res.clients.data,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  onSaveInvoice = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { invoice, payments, items, validation } = this.state;
    const {
      invoice_no,
      description,
      purchase_order_no,
      amount_paid,
      client_id,
      cashier_id,
      currency,
      due_date,
      issued_date,
    } = invoice;

    this.setState({ submitted: true });
    let check_payment = amount_paid > this.totalCost();
    // let check_name = items.some(ele => ele.name === '');
    // let check_name_length = items.some(ele => ele.name.length > 24);
    let check_description = items.some((ele) => ele.description === "");
    let check_quantity =
      items.some((ele) => ele.quantity === 0) ||
      items.some((ele) => ele.quantity === "");
    let check_rate =
      items.some((ele) => ele.rate === 0) ||
      items.some((ele) => ele.rate === "");

    await this.setState({
      validation: {
        ...validation,
        invoice_no: invoice_no !== "",
        client_id: client_id !== "",
        due_date: due_date !== "",
        currency: currency !== "",
        issued_date: issued_date !== "",
        amount_paid: amount_paid !== "",
        // purchase_order_no: purchase_order_no !== ''
      },
    });
    if (
      Object.values(this.state.validation).every(Boolean) &&
      !check_payment &&
      !check_description &&
      !check_rate &&
      !check_quantity
    ) {
      this.setState({ submitted: false });
      this.saveInvoice();
    } else {
      const errors = Object.keys(this.state.validation).filter((id) => {
        return !this.state.validation[id];
      });
      await setTimeout(
        () =>
          toast.error(
            <div style={{ padding: "10px 20px" }}>
              <p style={{ margin: 0, fontWeight: "bold", color: "white" }}>
                Errors:
              </p>
              {errors.map((v) => (
                <p key={v} style={{ margin: 0, fontSize: 14, color: "white" }}>
                  * {this.validationRules(v)}
                </p>
              ))}
            </div>
          ),
        250
      );
    }
  };

  validationRules = (field) => {
    if (field === "invoice_no") {
      return "Invoice number is required";
    } else if (field === "issued_date") {
      return "Issue date is required";
    } else if (field === "due_date") {
      return "Due date is required";
    } else if (field === "client_id") {
      return "Client is required";
    } else if (field === "cashier_id") {
      return "Cashier is required";
    }
  };

  saveInvoice = () => {
    this.setState({ saving: true });
    const { items, invoice } = this.state;
    const {
      amount_paid,
      purchase_order_no,
      client_id,
      description,
      currency,
      due_date,
      issued_date,
    } = invoice;

    let data = new FormData();
    var balance = this.totalCost() - amount_paid;
    data.set("purchase_order_no", purchase_order_no);
    data.set("invoice_description", description);
    data.set("client_id", client_id);
    data.set("currency", currency);
    data.set("due_date", due_date);
    data.set("issued_date", issued_date);
    data.set("total_amount", this.totalCost());
    data.set("balance", balance);
    data.set("amount_paid", amount_paid);

    for (var i in items) {
      data.set(`quantity[${i}]`, items[i].quantity);
      data.set(`rate[${i}]`, items[i].rate);
      data.set(`amount[${i}]`, items[i].rate * items[i].quantity);
      data.set(`description[${i}]`, items[i].description);
    }

    return axios
      .post(
        `${settings.API_URL}updateinvoice/${this.state.invoice.id}`,
        data,
        {
          headers: authHeader(),
        },
        authService.handleResponse
      )
      .then((res) => {
        this.setState({ saving: false, edit: false });
        this.getInvoice();
        //this.props.saved();
        //this.props.toggle();
        this.showToast("Invoice updated");
      })
      .catch((err) => {
        if (err) {
          toast.dismiss();
          console.log(err);
          toast.configure({ hideProgressBar: true, closeButton: false });
          this.showToastError(
            "An Invoice with this invoice number address already exist"
          );
          this.setState({ saving: false });
        }
      });
  };

  handleAddItem = () => {
    this.setState({
      items: this.state.items.concat([
        { name: "", rate: 0, quantity: 0, description: "" },
      ]),
    });
  };

  handleRemoveItem = (idx) => () => {
    this.setState({
      items: this.state.items.filter((s, sidx) => idx !== sidx),
    });
  };

  onChange = (e, state) => {
    const { invoice } = this.state;

    this.setState({ invoice: { ...invoice, [state]: e } });
  };

  toggleEditPayment = (payment) => {
    this.setState({ payment });
    this.getInvoice();
  };

  handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const { items } = this.state;
    const list = [...items];
    list[index][name] = value;
    this.setState({ items: list });
  };

  handleInputNumericChange = (e, index) => {
    const { name, value } = e.target;
    const { items } = this.state;
    const list = [...items];
    list[index][name] = value.replace(/\D/g, "");
    this.setState({ items: list });
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  };
  showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "white" }}>{msg}</div>);
  };

  onChange = (e, state) => {
    const { invoice } = this.state;
    this.setState({ invoice: { ...invoice, [state]: e } });
  };

  toggleEdit = () => {
    this.setState({ edit: !this.state.edit });
  };

  getInvoice = () => {
    const { id } = this.state;
    this.setState({ loading: true });
    getInvoice(id).then(
      (res) => {
        this.setState({
          invoice: res.invoice,
          payments: res.payments,
          items: res.items,
          pos_items: res.pos_items,
          total_balance: res.total_balance,
          prev_balance: res.prev_balance,
          loading: false,
          edit: false,
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

  toggleAddClient = () => {
    this.setState({ addClient: !this.state.addClient });
  };

  totalCost = () => {
    const { items } = this.state;

    var total = 0;
    for (let v = 0; v < items.length; v++) {
      total += items[v].rate * items[v].quantity;
    }
    return total;
  };

  formatCurrency(x) {
    if (x !== null && x !== 0 && x !== undefined) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${parts.join(".")}`;
    }
    return "0";
  }

  getBalance() {
    const { payments, invoice } = this.state;
    const total_amount = invoice.amount;
    return this.setState({
      total_amount: total_amount,
    });
  }

  render() {
    const {
      saving,
      hideNav,
      addPayment,
      pos_items,
      user,
      company,
      payment,
      total_amount,
      previous_payment,
      balance,
      clients,
      submitted,
      currency,
      addClient,
      edit,
      items,
      payments,
      loading,
      invoice,
      show,
      total_balance,
      prev_balance,
    } = this.state;
    return (
      <>
        {loading && <SpinDiv text={"Loading..."} />}

        {invoice && (
          <div style={{ display: "none" }}>
            <Invoice2
              pos_items={pos_items}
              items={items}
              invoice={invoice}
              company={company}
              user={user}
              total_balance={total_balance}
              prev_balance={prev_balance}
              ref={(el) => (this.componentRef2 = el)}
              toggle={() => this.setState({ invoice: [] })}
            />
          </div>
        )}

        {addClient && (
          <AddClient
            saved={this.getClients}
            addClient={addClient}
            toggle={() => this.setState({ addClient: null })}
          />
        )}

        {addPayment && (
          <AddPayment
            saved={this.getInvoice}
            addPayment={addPayment}
            payments={payments}
            invoice={invoice}
            toggle={() => this.setState({ addPayment: null })}
          />
        )}

        {payment && (
          <EditPayment
            saved={this.getInvoice}
            payment={payment}
            payments={payments}
            invoice={invoice}
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
                  <Breadcrumb.Item href="/invoices">Invoices</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                {!hideNav && (
                  <ButtonGroup>
                    {(user.admin === 1 || user.id === invoice.cashier_id) && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => this.toggleAddPayment()}
                      >
                        + New Payment
                      </Button>
                    )}

                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        //console.log('111')
                        this.props.history.push("/new/invoice");
                      }}
                    >
                      + New Invoice
                    </Button>

                    {Object.keys(invoice).length !== 0 ? (
                      <ReactToPrint
                        trigger={() => {
                          return (
                            <Button
                              variant="outline-success"
                              href="#"
                              size="md"
                            >
                              Print Invoice
                            </Button>
                          );
                        }}
                        content={() => this.componentRef2}
                      />
                    ) : (
                      ""
                    )}
                  </ButtonGroup>
                )}
              </div>
            </div>
          </Col>
        </Row>
        <Card border="light" className="shadow-sm mb-4">
          <Card.Body className="pb-0">
            <Row>
              <Row>
                <Col md={12}>
                  <Row style={{ marginBottom: 20 }}>
                    <Col md={2}>
                      <ButtonGroup>
                        {(user.admin === 1 || user.id === invoice.cashier_id) &&
                          invoice.payment_type == "MANUAL" &&
                          payments.length <= 1 && (
                            <Button
                              color={edit ? "primary" : "success"}
                              onClick={this.toggleEdit}
                              size="sm"
                              variant="outline-primary"
                            >
                              {edit ? "Discard Changes" : "+ Edit Invoice"}
                            </Button>
                          )}
                      </ButtonGroup>
                    </Col>
                    <Col md={3} style={{ fontSize: 15, fontWeight: "bold" }}>
                      Invoice Amount :<span>{invoice.currency}</span>
                      {this.formatCurrency(invoice.amount)}
                    </Col>

                    <Col md={3} style={{ fontSize: 15, fontWeight: "bold" }}>
                      Paid: <span>{invoice.currency}</span>
                      {this.formatCurrency(invoice.total_payment)}
                    </Col>
                    <Col md={3} style={{ fontSize: 15, fontWeight: "bold" }}>
                      Invoice Balance: <span>{invoice.currency}</span>
                      {this.formatCurrency(invoice.balance)}
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4} style={{ fontSize: 15, fontWeight: "bold" }}>
                      Previous Client Balance: <span>{invoice.currency}</span>
                      {this.formatCurrency(prev_balance)}
                    </Col>

                    <Col md={4} style={{ fontSize: 15, fontWeight: "bold" }}>
                      Total Client Balance: <span>{invoice.currency}</span>
                      {this.formatCurrency(total_balance)}
                    </Col>
                    <Col md={4}>
                      <span style={{ fontSize: 15, fontWeight: "bold" }}>
                        Cashier: <span>{invoice.cashier_name}</span>
                      </span>
                    </Col>
                  </Row>
                  <Row
                    style={{
                      border: "1px #eee solid",
                      padding: "10px 5px 0px",
                      margin: "15px 2px",
                      borderRadius: 7,
                    }}
                  >
                    <Col md={3} className="mb-3">
                      <Form.Group id="Invoice no">
                        <Form.Label>Invoice No</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </InputGroup.Text>
                          <Input
                            type="text"
                            name="invoice_no"
                            disabled
                            value={invoice.invoice_no || ""}
                            onChange={async (e) => {
                              await this.onChange(e.target.value, "invoice_no");
                            }}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md="3">
                      <FormGroup className="form-date">
                        <Form.Label> Date</Form.Label>
                        <ReactDatetime
                          value={
                            moment(invoice.issued_date).format(
                              "MMM DD, YYYY"
                            ) || ""
                          }
                          disabled={!edit}
                          dateFormat={"MMM D, YYYY"}
                          closeOnSelect
                          onChange={(e) => this.onChange(e, "issued_date")}
                          inputProps={{
                            required: true,
                            className: "form-control date-width",
                          }}
                          timeFormat={false}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup className="form-date">
                        <Form.Label> Due Date</Form.Label>
                        <ReactDatetime
                          value={
                            moment(invoice.due_date).format("MMM DD, YYYY") ||
                            ""
                          }
                          dateFormat={"MMM D, YYYY"}
                          closeOnSelect
                          onChange={(e) => this.onChange(e, "due_date")}
                          inputProps={{
                            required: true,
                            className: "form-control date-width",
                          }}
                          timeFormat={false}
                          disabled={!edit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-2">
                        <Form.Label>Total Purchase</Form.Label>
                        <InputGroup>
                          <Input
                            type="text"
                            value={
                              invoice.currency +
                              this.formatCurrency(this.totalCost() + ".00")
                            }
                            disabled
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row
                    style={{
                      border: "1px #eee solid",
                      padding: "10px 5px 0px",
                      margin: "15px 2px",
                      borderRadius: 7,
                    }}
                  >
                    <Col md={4}>
                      <Form.Group className="mb-2">
                        <Form.Label>Amount Received</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </InputGroup.Text>
                          <InputNumber
                            style={{
                              width: "auto",
                              height: 40,
                              paddingTop: 5,
                              borderRadius: 5,
                              fontSize: 18,
                            }}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            onKeyPress={(event) => {
                              if (!/[0-9]/.test(event.key)) {
                                event.preventDefault();
                              }
                            }}
                            disabled
                            value={invoice.total_payment}
                            onChange={(e) => this.onChange(e, "amount_paid")}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-2">
                        <Form.Label>Clients</Form.Label>

                        <Form.Select
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "client_id");
                          }}
                          value={invoice.client_id}
                          style={{
                            marginRight: 10,
                            width: "100%",
                          }}
                          disabled={!edit}
                        >
                          <option value="">Select Client</option>
                          {clients.length == 0 && ""}
                          {clients.map((p, index) => (
                            <option value={p.id} key={p}>
                              {p.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2} style={{ paddingTop: 20 }}>
                      <ButtonGroup>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={!edit}
                          onClick={() => this.toggleAddClient()}
                        >
                          + New Client
                        </Button>
                      </ButtonGroup>
                    </Col>
                  </Row>
                  <Row
                    style={{
                      border: "1px #eee solid",
                      padding: "10px 5px 0px",
                      margin: "15px 2px",
                      borderRadius: 7,
                    }}
                  ></Row>
                </Col>
              </Row>

              <Row
                style={{
                  border: "1px #eee solid",
                  padding: "10px 5px 0px",
                  margin: "15px 2px",
                  borderRadius: 7,
                }}
              >
                <Form.Label style={{ fontSize: 15 }}>ITEMS</Form.Label>

                {items.length > 0
                  ? items.map((item, key) => (
                      <Col
                        md={12}
                        style={{
                          border: "1px #eee solid",
                          padding: "10px 5px 0px 10px",
                          margin: "15px 10px 0px 10px ",
                          borderRadius: 7,
                        }}
                      >
                        <Row style={{ margin: "15px 10px 0px 10px " }}>
                          <Col md={3}>
                            <Form.Group className="mb-2">
                              <Form.Label>Description</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>
                                  <FontAwesomeIcon icon={faPencilAlt} />
                                </InputGroup.Text>
                                <Input
                                  type="text"
                                  disabled={!edit}
                                  placeholder={`Item nme description ${
                                    key + 1
                                  }`}
                                  value={item.description}
                                  onChange={(e) =>
                                    this.handleInputChange(e, key)
                                  }
                                  name="description"
                                  class="w-auto"
                                />
                              </InputGroup>
                            </Form.Group>
                            {submitted && !item.description && (
                              <div style={{ color: "red" }}>
                                Description is required
                              </div>
                            )}
                          </Col>
                          <Col md={2}>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Group className="mb-2">
                              <InputGroup>
                                <InputGroup.Text>
                                  <FontAwesomeIcon icon={faPencilAlt} />
                                </InputGroup.Text>
                                <Input
                                  type="text"
                                  disabled={!edit}
                                  name="quantity"
                                  placeholder={`Item quantity ${key + 1}`}
                                  value={item.quantity}
                                  class="w-auto"
                                  onChange={(e) =>
                                    this.handleInputNumericChange(e, key)
                                  }
                                />
                              </InputGroup>
                            </Form.Group>
                            {submitted && !item.quantity && (
                              <div style={{ color: "red" }}>
                                Quantity is required
                              </div>
                            )}
                          </Col>
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label>Price</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>
                                  <FontAwesomeIcon icon={faPencilAlt} />
                                </InputGroup.Text>
                                <Input
                                  type="text"
                                  disabled={!edit}
                                  placeholder={`Item Price ${key + 1}`}
                                  value={item.rate}
                                  onChange={(e) =>
                                    this.handleInputNumericChange(e, key)
                                  }
                                  name="rate"
                                  class="w-auto"
                                />
                              </InputGroup>
                            </Form.Group>
                            {submitted && !item.rate && (
                              <div style={{ color: "red" }}>
                                Price is required
                              </div>
                            )}
                          </Col>
                          <Col md={3}>
                            <Form.Group className="mb-2">
                              <Form.Label>Amount</Form.Label>
                              <InputGroup>
                                <Input
                                  disabled
                                  type="text"
                                  value={item.quantity * item.rate}
                                />
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col md={2} style={{ marginBottom: 10 }}>
                            <Row>
                              <Form.Label>More Items</Form.Label>
                            </Row>

                            <ButtonGroup>
                              {items.length && items.length - 1 === key && (
                                <Button
                                  variant="outline-primary"
                                  size="md"
                                  disabled={!edit}
                                  onClick={this.handleAddItem}
                                >
                                  +
                                </Button>
                              )}
                              {items.length && items.length !== 1 && (
                                <Button
                                  variant="outline-danger"
                                  size="md"
                                  disabled={!edit}
                                  onClick={this.handleRemoveItem(key)}
                                >
                                  X
                                </Button>
                              )}
                            </ButtonGroup>
                          </Col>
                        </Row>
                      </Col>
                    ))
                  : ""}
                {pos_items.length > 0
                  ? pos_items.map((item, key) => (
                      <Row
                        md={12}
                        style={{
                          border: "1px #eee solid",
                          padding: "10px 5px 0px 10px",
                          margin: "15px 10px 0px 10px ",
                          borderRadius: 7,
                        }}
                      >
                        <Col md={3}>
                          <Form.Group className="mb-2">
                            <Form.Label>Description</Form.Label>
                            <InputGroup>
                              <InputGroup.Text>
                                <FontAwesomeIcon icon={faPencilAlt} />
                              </InputGroup.Text>
                              <Input
                                type="text"
                                disabled={!edit}
                                placeholder={`Item nme description ${key + 1}`}
                                value={item.order.product_name}
                                name="description"
                                class="w-auto"
                              />
                            </InputGroup>
                          </Form.Group>
                          {submitted && !item.description && (
                            <div style={{ color: "red" }}>
                              Description is required
                            </div>
                          )}
                        </Col>
                        <Col md={2}>
                          <Form.Label>Quantity</Form.Label>
                          <Form.Group className="mb-2">
                            <InputGroup>
                              <InputGroup.Text>
                                <FontAwesomeIcon icon={faPencilAlt} />
                              </InputGroup.Text>
                              <Input
                                type="text"
                                disabled={!edit}
                                name="quantity"
                                placeholder={`Item quantity ${key + 1}`}
                                value={item.qty_sold}
                                class="w-auto"
                                onChange={(e) =>
                                  this.handleInputNumericChange(e, key)
                                }
                              />
                            </InputGroup>
                          </Form.Group>
                          {submitted && !item.quantity && (
                            <div style={{ color: "red" }}>
                              Quantity is required
                            </div>
                          )}
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Price</Form.Label>
                            <InputGroup>
                              <InputGroup.Text>
                                <FontAwesomeIcon icon={faPencilAlt} />
                              </InputGroup.Text>
                              <Input
                                type="text"
                                disabled={!edit}
                                placeholder={`Item Price ${key + 1}`}
                                value={item.selling_price}
                                name="rate"
                                class="w-auto"
                              />
                            </InputGroup>
                          </Form.Group>
                          {submitted && !item.rate && (
                            <div style={{ color: "red" }}>
                              Price is required
                            </div>
                          )}
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-2">
                            <Form.Label>Amount</Form.Label>
                            <InputGroup>
                              <Input
                                disabled
                                type="text"
                                value={item.qty_sold * item.selling_price}
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>
                    ))
                  : ""}
                <Row>
                  <Col md={8}></Col>
                  <Col md={4}>
                    <Row style={{ fontSize: 20, fontWeight: "bold" }}>
                      <Col md={12}>
                        Subtotal:{" "}
                        <span style={{ fontSize: 15 }}>{invoice.currency}</span>
                        {this.formatCurrency(invoice.amount)}
                      </Col>
                    </Row>
                    <Row style={{ fontSize: 20, fontWeight: "bold" }}>
                      <Col md={12}>
                        Total Cost:{" "}
                        <span style={{ fontSize: 15 }}>{invoice.currency}</span>
                        {this.formatCurrency(invoice.amount)}
                      </Col>
                    </Row>
                    <Row style={{ fontSize: 20, fontWeight: "bold" }}>
                      <Col md={12}>
                        Amount Received:{" "}
                        <span style={{ fontSize: 15 }}>{invoice.currency}</span>
                        {this.formatCurrency(invoice.total_payment)}
                      </Col>
                    </Row>
                    <Row style={{ fontSize: 20, fontWeight: "bold" }}>
                      <Col md={12}>
                        Balance:{" "}
                        <span style={{ fontSize: 15 }}>{invoice.currency}</span>
                        {this.formatCurrency(invoice.total_balance)}
                      </Col>
                    </Row>
                    <Row style={{ fontSize: 20, fontWeight: "bold" }}>
                      <Col md={12}>
                        Prev Balance:{" "}
                        <span style={{ fontSize: 15 }}>{invoice.currency}</span>
                        {this.formatCurrency(prev_balance)}
                      </Col>
                    </Row>
                    <Row style={{ fontSize: 20, fontWeight: "bold" }}>
                      <Col md={12}>
                        Total Balance:{" "}
                        <span style={{ fontSize: 15 }}>{invoice.currency}</span>
                        {this.formatCurrency(total_balance)}
                      </Col>
                    </Row>
                    {edit && (
                      <Row style={{ fontSize: 20, fontWeight: "bold" }}>
                        <Col md={12}>
                          <Button
                            variant="outline-primary"
                            size="md"
                            disabled={saving}
                            onClick={this.onSaveInvoice}
                          >
                            + Update Invoice
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </Col>
                </Row>
              </Row>
              {hideNav === true ? (
                <Row
                  style={{
                    border: "1px #eee solid",
                    padding: "10px 5px 0px",
                    margin: "15px 2px",
                    borderRadius: 7,
                  }}
                >
                  <Form.Label style={{ fontSize: 25 }}>Payments</Form.Label>
                  {payments.map((payment, key) => {
                    return (
                      <Col
                        md={12}
                        style={{
                          border: "1px #eee solid",
                          padding: "10px 5px 0px 10px",
                          margin: "15px 10px 0px 10px",
                          borderRadius: 7,
                        }}
                      >
                        <Row style={{ margin: "10px 10px 0px 10px" }}>
                          <Form.Label style={{ fontSize: 20 }}>
                            {this.ordinal(key + 1)} Payments
                          </Form.Label>
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label>Invoice No</Form.Label>
                              <Input value={payment.invoice_num} disabled />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label>Amount</Form.Label>
                              <Input
                                value={`${
                                  invoice.currency
                                }${this.formatCurrency(payment.amount)}`}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label>Paid</Form.Label>
                              <Input
                                value={`${
                                  invoice.currency
                                }${this.formatCurrency(payment.amount_paid)}`}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label>Transaction Date</Form.Label>
                              <Input
                                value={moment(payment.created_at).format(
                                  "MMM DD YYYY"
                                )}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                          <Col
                            md={12}
                            style={{ marginTop: 10, marginBottom: 20 }}
                          >
                            <ButtonGroup>
                              {user.admin === 1 && payments.length >= 1 && (
                                <Button
                                  variant="outline-primary"
                                  onClick={() =>
                                    this.toggleEditPayment(payment)
                                  }
                                  size="md"
                                >
                                  Edit
                                </Button>
                              )}
                            </ButtonGroup>
                          </Col>
                        </Row>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <Row>
                  <h5 style={{ fontWeight: "bold", marginTop: 15 }}>
                    Payments
                  </h5>
                  <Table
                    responsive
                    className="table-centered table-nowrap rounded mb-0"
                  >
                    <thead className="thead-light">
                      <tr>
                        <th className="border-0">Invoice No</th>
                        <th className="border-0">Amount</th>
                        <th className="border-0">Paid</th>
                        {/* <th className="border-0">Balance</th> */}
                        <th className="border-0">Transaction Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment, key) => {
                        return (
                          <tr style={{ fontWeight: "bold" }}>
                            <td>{payment.invoice_num}</td>
                            <td>
                              {invoice.currency}
                              {this.formatCurrency(payment.amount)}
                            </td>
                            <td>
                              {invoice.currency}
                              {this.formatCurrency(payment.amount_paid)}
                            </td>
                            {/* <td >{invoice.currency}{this.formatCurrency(payment.balance)}</td> */}
                            <td>
                              {moment(payment.created_at).format("MMM DD YYYY")}
                            </td>

                            <td>
                              <ButtonGroup>
                                {user.admin === 1 && payments.length >= 1 && (
                                  <Button
                                    variant="outline-primary"
                                    onClick={() =>
                                      this.toggleEditPayment(payment)
                                    }
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
                        <td>
                          {" "}
                          Total Payments: <span>{invoice.currency}&nbsp;</span>
                          {this.formatCurrency(invoice.total_payment)}
                        </td>
                        <td>
                          {" "}
                          Balance: <span>{invoice.currency}&nbsp;</span>
                          {this.formatCurrency(invoice.total_balance)}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Row>
              )}
            </Row>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default EditInvoice;
