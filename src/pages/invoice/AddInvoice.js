import React, { Component } from "react";

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
import {
  faEnvelope,
  faPhone,
  faLock,
  faPencilAlt,
  faAddressCard,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SpinDiv from "../components/SpinDiv";
import axios from "axios";
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";
import { toast } from "react-toastify";
import { FormGroup, CardHeader, Media, Input, Modal } from "reactstrap";
import moment from "moment";
import ReactDatetime from "react-datetime";
import AddClient from "../clients/AddClient";
import { getInvoiceId } from "../../services/invoiceService";
import { getClients } from "../../services/clientService";
import { currencies } from "./Currency";
import ReactToPrint from "react-to-print";
import { InputNumber, Popover, Button, Select, Spin } from "antd";

import Invoice2 from "./Invoice2";

const { Option } = Select;

const InvoiceOverview = (
  <div>
    <Card border="light" className="shadow-sm mb-4">
      <Card.Body className="pb-0">
        <h4>How to use Invoice</h4>
        <h5 style={{ paddingLeft: 5 }}>
          {" "}
          Please Note the following steps to create an Invoice
        </h5>
        <p>
          <ul>
            <li>
              <b>Credits</b> i.e Money received from your Clients, irrespective
              of your transaction (No Outstanding)
            </li>
            <li>
              <b>Debtors</b> Transactions that involves user not making full
              payment i.e having an outstanding
            </li>
            <li>
              <b>Invoice No</b>You are to input the invoice-No, Note this is
              generated automatically
            </li>
            <li>
              <b>Issue Date</b>You are to choose the date when the transaction
              was done
            </li>
            <li>
              <b>Due Date</b> Date at which the client is suppose to pay their
              Outstandings
            </li>
            <li>
              <b>Amount Received</b>This is the amount you are been paid by the
              customer
            </li>
            <li>
              <b>Currency</b>You are allowed to choose the currency at which the
              transaction was performed
            </li>
          </ul>
        </p>
        <h3>Also Note:</h3>
        <ul>
          <li>
            If your the amount paid is equal to the total transaction, this
            invoice is categorized as a credit
          </li>
          <li>
            If your the amount paid is less than the total transaction, the
            balance is place under debts
          </li>
        </ul>
      </Card.Body>
    </Card>
  </div>
);

export class AddInvoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: 10,
      page: 1,
      loading: false,
      client_id: "",
      invoice_no: "",
      new_items: [],
      items: [{ name: "", item_description: "", quantity: 0, rate: 0 }],
      amount_paid: 0,
      currency: "",
      purchase_order_no: "",
      description: "",
      validation: {},
      errors: {},
      issue_date: moment().startOf("day"),
      due_date: moment().startOf("day"),
      clients: [],
      currencies: currencies,
      invoice_last_id: "",
      submitted: false,
      invalidItems: [],
      receipt: {},
      hideNav: false,
      company: JSON.parse(localStorage.getItem("company")),
      user: JSON.parse(localStorage.getItem("user")),
      english_ordinal_rules: new Intl.PluralRules("en", { type: "ordinal" }),
      suffixes: { one: "st", two: "nd", few: "rd", other: "th" },
      total_balance: 0,
      prev_balance: 0,
      pos_items: [],
    };
    this.baseState = this.state;
  }

  resetForm = () => {
    window.location.reload();
  };

  validationRules = (field) => {
    if (field === "invoice_no") {
      return "Invoice number is required";
    } else if (field === "issue_date") {
      return "Issue date is required";
    } else if (field === "due_date") {
      return "Due date is required";
    } else if (field === "client_id") {
      return "Client is required";
    } else if (field === "currency") {
      return "Currency is required";
      // }else if(field === 'purchase_order_no'){
      //     return "Purchase Order No is required";
    } else if (field === "amount_paid") {
      return "Deposit field is required";
    }
  };

  ordinal(number) {
    const { suffixes, english_ordinal_rules } = this.state;
    const suffix = suffixes[english_ordinal_rules.select(number)];
    return number + suffix;
  }

  isNumberKey(evt) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;

    return true;
  }

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };
  showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "red" }}>{msg}</div>);
  };
  componentDidMount = () => {
    window.addEventListener("resize", this.resize.bind(this));
    this.getClients();
    this.getInvoiceId();

    toast.dismiss();
    toast.configure({ hideProgressBar: true, closeButton: false });
  };

  resize() {
    this.setState({ hideNav: window.innerWidth <= 760 });
  }

  getInvoiceId = () => {
    //this.setState({loading:true})

    getInvoiceId().then(
      (res) => {
        this.setState({
          invoice_no: res.invoice ? "INV-" + (res.invoice.id + 1) : "INV-1",
          items: [{ name: "", item_description: "", quantity: 0, rate: 0 }],
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  toggleAddClient = () => {
    this.setState({ addClient: !this.state.addClient });
  };

  getClients = () => {
    const { page, rows, search, clients } = this.state;
    this.setState({ loading: true });
    getClients({ page, rows, search }).then(
      (res) => {
        this.setState({
          clients: [...clients, ...res.clients.data],
          loading: false,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  handlePopupScroll = (e) => {
    const { loading, hasMore } = this.state;

    if (loading || !hasMore) return;

    const { target } = e;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      this.setState(
        (prevState) => ({ page: prevState.page + 1 }),
        () => this.getClients()
      );
    }
  };

  handleSearchClient = (value) => {
    this.setState({ search: value, page: 1, clients: [], hasMore: true }, () =>
      this.getClients()
    );
  };

  handleClientChange = (selected) => {
    this.setState({
      client_id: selected.value,
    });
  };

  onSaveInvoice = async (e) => {
    e.preventDefault();
    //e.target.reset();
    await toast.dismiss();
    const {
      items,
      validation,
      invoice_no,
      purchase_order_no,
      client_id,
      amount_paid,
      cashier_id,
      currency,
      due_date,
      issue_date,
    } = this.state;

    this.setState({ submitted: true });

    let check_description = items.some((ele) => ele.item_description === "");
    let check_quantity =
      items.some((ele) => ele.quantity === 0) ||
      items.some((ele) => ele.quantity === "");
    let check_rate =
      items.some((ele) => ele.rate === 0) ||
      items.some((ele) => ele.rate === "");
    console.log(amount_paid);
    await this.setState({
      validation: {
        ...validation,
        invoice_no: invoice_no !== "",
        client_id: client_id !== "",
        due_date: due_date !== "",
        currency: currency !== "",
        issue_date: issue_date !== "",
        amount_paid: amount_paid !== "" && amount_paid !== null,
      },
    });
    if (
      Object.values(this.state.validation).every(Boolean) &&
      //   !check_payment &&
      !check_description &&
      !check_rate &&
      !check_quantity
    ) {
      this.setState({ submitted: false });
      this.saveInvoice();
    } else {
      const errorss = Object.keys(this.state.validation).filter((id) => {
        return !this.state.validation[id];
      });
      toast.dismiss();
      toast.configure({ hideProgressBar: true, closeButton: false });
      toast(
        <div style={{ padding: "10px 20px" }}>
          <p style={{ margin: 0, fontWeight: "bold", color: "red" }}>Errors:</p>
          {errorss.map((v) => (
            <p key={v} style={{ margin: 0, fontSize: 14, color: "red" }}>
              * {this.validationRules(v)}
            </p>
          ))}
        </div>
      );
    }
  };

  formatCurrency(x) {
    if (x !== null && x !== "0" && x !== undefined) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${parts.join(".")}`;
    }
    return "0";
  }

  saveInvoice = () => {
    this.setState({ saving: true });

    const {
      invoice_no,
      purchase_order_no,
      description,
      amount_paid,
      items,
      client_id,
      currency,
      due_date,
      issue_date,
    } = this.state;

    let data = new FormData();
    var balance = this.totalCost() - amount_paid;
    data.set("invoice_no", invoice_no);
    data.set("purchase_order_no", purchase_order_no);
    data.set("description", description);
    data.set("client_id", client_id);
    data.set("currency", currency);
    data.set("due_date", due_date);
    data.set("issue_date", issue_date);
    data.set("total_amount", this.totalCost());
    data.set("balance", balance);
    data.set("amount_paid", amount_paid);
    for (var i in items) {
      // data.set(`name[${i}]`, items[i].name);
      data.set(`quantity[${i}]`, items[i].quantity);
      data.set(`rate[${i}]`, items[i].rate);
      data.set(`amount[${i}]`, items[i].rate * items[i].quantity);
      data.set(`item_description[${i}]`, items[i].item_description);
    }

    return axios
      .post(
        `${settings.API_URL}addinvoice`,
        data,
        {
          headers: authHeader(),
        },
        authService.handleResponse
      )
      .then((res) => {
        this.setState({
          saving: false,
          client_id: "",
          invoice_no: "",
          new_items: [],
          items: [{ name: "", item_description: "", quantity: 0, rate: 0 }],
          amount_paid: 0,
          currency: "",
          purchase_order_no: "",
          description: "",
          receipt: res.data.invoice,
          new_items: res.data.items,
          total_balance: res.data.total_balance,
          prev_balance: res.data.prev_balance,
        });
        this.getInvoiceId();
        this.getClients();

        {
          console.log(res);
        }
        this.showToast("Invoice created");
      })
      .catch((err) => {
        if (err) {
          toast.dismiss();
          toast.configure({ hideProgressBar: true, closeButton: false });
          this.showToastError(
            "Network Error: Please check your Internet connection or refresh page"
          );

          this.setState({ saving: false });
        }
      });
  };

  onChange = (e, state) => {
    this.setState({ [state]: e });
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

  handleAddItem = () => {
    this.setState({
      items: this.state.items.concat([
        { name: "", rate: 0, quantity: 0, item_description: "" },
      ]),
    });
  };

  handleRemoveItem = (idx) => () => {
    this.setState({
      items: this.state.items.filter((s, sidx) => idx !== sidx),
    });
  };

  totalCost = () => {
    const { items } = this.state;
    var total = 0;
    for (let v = 0; v < items.length; v++) {
      total += items[v].rate * items[v].quantity;
    }
    return total;
  };

  render() {
    const {
      loading,
      user,
      hideNav,
      currencies,
      new_items,
      total_balance,
      description,
      company,
      receipt,
      submitted,
      invoice_no,
      amount_paid,
      clients,
      addClient,
      items,
      issue_date,
      currency,
      due_date,
      saving,
      pos_items,
      prev_balance,
    } = this.state;
    return (
      <>
        {receipt && (
          <div style={{ display: "none" }}>
            <Invoice2
              pos_items={pos_items}
              items={new_items}
              invoice={receipt}
              company={company}
              user={user}
              total_balance={total_balance}
              prev_balance={prev_balance}
              ref={(el) => (this.componentRef = el)}
              toggle={() => this.setState({ receipt: [] })}
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
                  <Breadcrumb.Item href="/new/invoice">
                    New Invoice
                  </Breadcrumb.Item>
                </Breadcrumb>
              </div>
              {!hideNav && (
                <div className="btn-toolbar mb-2 mb-md-0">
                  <Button variant="outline-primary" size="md">
                    <Popover content={InvoiceOverview}>
                      Invoice Usage overview
                    </Popover>
                  </Button>

                  <ButtonGroup>
                    {Object.keys(receipt).length !== 0 ? (
                      <ReactToPrint
                        trigger={() => {
                          return (
                            <Button
                              variant="outline-success"
                              href="#"
                              size="sm"
                            >
                              Print Invoice
                            </Button>
                          );
                        }}
                        content={() => this.componentRef}
                      />
                    ) : (
                      ""
                    )}
                  </ButtonGroup>
                </div>
              )}
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg="8">
            <h5 className="mb-0">+ New Invoice </h5>
          </Col>
        </Row>
        <Card border="light" className="shadow-sm mb-4">
          <Card.Body className="pb-0">
            <Row>
              {saving && <SpinDiv text={"Saving..."} />}
              <Col md={10} className="mb-3">
                <Row
                  style={{
                    border: "1px #eee solid",
                    padding: "10px 5px 0px",
                    margin: "20px 15px",
                    borderRadius: 7,
                  }}
                >
                  <Col md={4} style={{ marginBottom: 20 }}>
                    <Form.Group className="mb-2">
                      <Form.Label> Invoice</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </InputGroup.Text>
                        <Input
                          type="text"
                          placeholder="Enter Invoice No"
                          name="invoice_no"
                          value={invoice_no}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "invoice_no");
                          }}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md="4" style={{ marginBottom: 20 }}>
                    <FormGroup className="form-date">
                      <Form.Label> Date </Form.Label>
                      <ReactDatetime
                        value={issue_date}
                        dateFormat={"MMM D, YYYY"}
                        closeOnSelect
                        onChange={(e) => this.onChange(e, "issue_date")}
                        inputProps={{
                          required: true,
                          className: "form-control date-width",
                        }}
                        timeFormat={false}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row
                  style={{
                    border: "1px #eee solid",
                    padding: "10px 5px 0px",
                    margin: "20px 15px",
                    borderRadius: 7,
                  }}
                >
                  <Col md="3" style={{ marginBottom: 20 }}>
                    <FormGroup className="form-date">
                      <Form.Label> Due Date</Form.Label>
                      <ReactDatetime
                        value={due_date}
                        dateFormat={"MMM D, YYYY"}
                        closeOnSelect
                        onChange={(e) => this.onChange(e, "due_date")}
                        inputProps={{
                          required: true,
                          className: "form-control date-width",
                        }}
                        timeFormat={false}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row
                  style={{
                    border: "1px #eee solid",
                    padding: "10px 5px 0px",
                    margin: "20px 15px",
                    borderRadius: 7,
                  }}
                >
                  <Col md={6} style={{ marginBottom: 20 }}>
                    <Form.Label>Clients</Form.Label>
                    <Select
                      showSearch
                      labelInValue
                      placeholder="Search Clients"
                      filterOption={false}
                      onSearch={this.handleSearchClient}
                      onPopupScroll={this.handlePopupScroll}
                      onChange={this.handleClientChange}
                      notFoundContent={loading ? <Spin size="small" /> : null}
                      style={{ width: "100%" }}
                    >
                      {clients.map((client) => (
                        <Option key={client.id} value={client.id}>
                          {client.name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col md={4} style={{ marginBottom: 20 }}>
                    <div>
                      <Form.Label>New Clients</Form.Label>
                    </div>
                    <ButtonGroup>
                      <Button
                        variant="outline-primary"
                        size="sm"
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
                    margin: "20px 15px",
                    borderRadius: 7,
                  }}
                >
                  <Col md={4} style={{ marginBottom: 20 }}>
                    <Form.Group className="mb-2">
                      <Form.Label>Total Purchase</Form.Label>
                      <InputGroup>
                        <Input
                          type="text"
                          value={
                            currency +
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
                    margin: "20px 15px",
                    borderRadius: 7,
                  }}
                >
                  <Col md={6} style={{ marginBottom: 20 }}>
                    <Form.Group>
                      <Form.Label>Invoice Description</Form.Label>
                      <InputGroup>
                        <Input
                          type="textarea"
                          rows={3}
                          cols={10}
                          placeholder={`Invoice Description `}
                          value={description}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "description");
                          }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row
              style={{
                border: "1px #eee solid",
                padding: "10px 5px 0px",
                margin: "15px 15px",
                borderRadius: 7,
              }}
            >
              <Form.Label style={{ fontSize: 25 }}>ITEMS SECTION</Form.Label>

              {items.map((item, key) => (
                <Col
                  md={12}
                  style={{
                    border: "1px #eee solid",
                    padding: "10px 5px 0px 10px",
                    margin: "15px 10px 0px 10px ",
                    borderRadius: 7,
                  }}
                >
                  <Form.Label style={{ fontSize: 20 }}>
                    {this.ordinal(key + 1)} Item
                  </Form.Label>
                  <Row style={{ margin: "15px 10px 0px 10px " }}>
                    <Col md={6}>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-2">
                            <Form.Label>Description</Form.Label>
                            <InputGroup>
                              <InputGroup.Text>
                                <FontAwesomeIcon icon={faPencilAlt} />
                              </InputGroup.Text>
                              <Input
                                type="textarea"
                                rows={3}
                                cols={100}
                                placeholder={`Item name and description`}
                                value={item.item_description}
                                onChange={(e) => this.handleInputChange(e, key)}
                                name="item_description"
                                class="w-auto"
                              />
                            </InputGroup>
                          </Form.Group>
                          {submitted && !item.item_description && (
                            <div style={{ color: "red" }}>
                              Description is required
                            </div>
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col md={12}>
                          <Form.Label>Quantity</Form.Label>
                          <Form.Group className="mb-2">
                            <InputGroup>
                              <InputGroup.Text>
                                <FontAwesomeIcon icon={faPencilAlt} />
                              </InputGroup.Text>
                              <Input
                                type="text"
                                name="quantity"
                                placeholder={`Item quantity`}
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
                      </Row>
                    </Col>

                    <Col md={6}>
                      <Row>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Price</Form.Label>
                            <InputGroup>
                              <InputGroup.Text>
                                <FontAwesomeIcon icon={faPencilAlt} />
                              </InputGroup.Text>
                              <Input
                                type="text"
                                placeholder={`Item Price `}
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
                        <Col md={3} style={{ marginBottom: 10 }}>
                          <Row>
                            <Form.Label>More Items</Form.Label>
                          </Row>

                          <ButtonGroup>
                            {items.length - 1 === key && (
                              <Button
                                variant="outline-primary"
                                size="md"
                                onClick={this.handleAddItem}
                              >
                                +
                              </Button>
                            )}
                            {items.length !== 1 && (
                              <Button
                                variant="outline-danger"
                                size="md"
                                onClick={this.handleRemoveItem(key)}
                              >
                                X
                              </Button>
                            )}
                          </ButtonGroup>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              ))}
              <Row>
                <Col md={4}></Col>
                <Col md={4} style={{ marginBottom: 20 }}>
                  <Form.Group className="mb-2">
                    <Form.Label>Currency</Form.Label>

                    <Form.Select
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "currency");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    >
                      <option value="">Select Currency</option>
                      {currencies.length == 0 && ""}
                      {currencies.map((p, index) => (
                        <option value={p.abbrev} key={p}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} style={{ marginBottom: 20 }}>
                  <Form.Group className="mb-2">
                    <Form.Label>Amount Received</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>{currency}</InputGroup.Text>
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
                        onChange={(e) => this.onChange(e, "amount_paid")}
                      />
                      {/* {submitted &&
                        this.state.amount_paid > this.totalCost() && (
                          <div style={{ color: "red" }}>
                            Amount received is more than total Cost
                          </div>
                        )} */}
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={8}></Col>
                <Col md={4}>
                  <Row style={{ fontSize: 20, fontWeight: "bold" }}>
                    <Col md={12}>
                      Subtotal:{" "}
                      <span style={{ fontSize: 15 }}>
                        {currency !== "" ? currency : "#"}
                      </span>
                      {this.formatCurrency(this.totalCost())}
                    </Col>
                  </Row>
                  <Row style={{ fontSize: 20, fontWeight: "bold" }}>
                    <Col md={12}>
                      Total Cost:{" "}
                      <span style={{ fontSize: 15 }}>
                        {currency !== "" ? currency : "#"}
                      </span>
                      {this.formatCurrency(this.totalCost())}
                    </Col>
                  </Row>
                  <Row style={{ fontSize: 20, fontWeight: "bold" }}>
                    <Col md={12}>
                      Amount Received:{" "}
                      <span style={{ fontSize: 15 }}>
                        {currency !== "" ? currency : "#"}
                      </span>
                      {this.formatCurrency(amount_paid)}
                    </Col>
                  </Row>
                  <Row style={{ fontSize: 20, fontWeight: "bold" }}>
                    <Col md={12}>
                      Balance:{" "}
                      <span style={{ fontSize: 15 }}>
                        {currency !== "" ? currency : "#"}
                      </span>
                      {this.formatCurrency(this.totalCost() - amount_paid)}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Row>

            <Row style={{ float: "right" }}>
              <Col md={12}>
                <div className="modal-footer" style={{ padding: "1rem" }}>
                  <ButtonGroup>
                    <Button
                      variant="primary"
                      type="button"
                      disabled={saving}
                      size="sm"
                      onClick={this.onSaveInvoice}
                    >
                      Save
                    </Button>

                    {!hideNav &&
                      (Object.keys(receipt).length !== 0 ? (
                        <ReactToPrint
                          trigger={() => {
                            return (
                              <Button
                                variant="outline-success"
                                href="#"
                                size="sm"
                              >
                                Print Invoice
                              </Button>
                            );
                          }}
                          content={() => this.componentRef}
                        />
                      ) : (
                        ""
                      ))}
                  </ButtonGroup>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default AddInvoice;
