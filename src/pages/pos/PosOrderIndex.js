import React, { Component } from "react";
import { Input, Media } from "reactstrap";
import { getStock } from "../../services/purchaseOrderService";
import { toast } from "react-toastify";
import Cart from "./Cart";
import {
  Col,
  Row,
  Card,
  Table,
  Button,
  ButtonGroup,
  Breadcrumb,
  Form,
  FormGroup,
  InputGroup,
} from "@themesberg/react-bootstrap";
import SpinDiv from "../components/SpinDiv";
import { throttle, debounce } from "../debounce";
import { addSales } from "../../services/posOrderService";
import ReactToPrint from "react-to-print";
import { Invoice } from "./Invoice";
import { Pagination } from "antd";
import { getBranchStocks } from "../../services/stockService";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { getCompany } from "../../services/companyService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import { getAllClients, getInvoiceId } from "../../services/invoiceService";
import { AsyncPaginate } from "react-select-async-paginate";
import AddClient from "../clients/AddClient";
import moment from "moment";
import ReactDatetime from "react-datetime";
import { InputNumber } from "antd";

export class PosOrderIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 3,
      loading: false,
      saving: false,
      stocks: [],
      cart_details: [],
      clients: [],
      invoice_last_id: "",
      transaction_id: "",
      sold_at: "",
      created_at: "",
      products: [],
      total_cost: [],

      order: "",
      value: "",
      invoice_no: "",
      total: 0,
      total_cart: 0,
      close: false,
      cartItem: [],
      options: [],
      cartCheckout: [],
      serials2: [],
      payment_mode: "",
      amount_paid: "",
      client_id: "",
      total_purchase: 0,
      selectedSerials: [],
      cart_sold: JSON.parse(localStorage.getItem("cart_sold")),
      user: JSON.parse(localStorage.getItem("user")),
      company: {},
      due_date: moment().startOf("month"),
      invoice: {},
      pos_items: [],
    };

    this.searchDebounced = debounce(this.getPurchaseOrders, 500);
    this.searchThrottled = throttle(this.getPurchaseOrders, 500);
  }

  componentDidMount() {
    this.getPurchaseOrders();
    this.getCompany();
    this.getClients();
    this.getInvoiceId();
    localStorage.removeItem("cart_sold");
    localStorage.removeItem("cart_details");
  }

  getClients = (search) => {
    const { rows } = this.state;
    getAllClients({ search }).then(
      (res) => {
        this.setState({
          clients: res.clients.map((opt) => ({
            label: opt.name,
            value: opt.id,
          })),
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  handleClientChange = async (client) => {
    await this.setState({ client_id: client.value });
  };

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

  loadClients =
    (data) =>
    async (search, loadedOptions, { page }) => {
      await this.getClients(page, search);
      console.log(data);

      return {
        options: data,
        hasMore: data.length >= 10000,
        additional: {
          page: search ? 2 : page + 1,
        },
      };
    };

  getCompany = () => {
    const { product_id, id, rows, page } = this.state;
    console.log(page);
    this.setState({ loading: true });
    getCompany().then(
      (res) => {
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

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  handleInputChange = (item, index) => (selectedSerials) => {
    const items = this.state.cartItem;
    let new_serials = selectedSerials.map((obj) => {
      return obj.value;
    });

    item.new_serials = new_serials;

    item.quantity = selectedSerials.length;
    items.splice(index, 1, item);
    this.setState({
      cartItem: items,
    });
    console.log(this.state.cartItem);
  };

  incrementCount(item, index) {
    // index will be the key value
    const items = this.state.cartItem;
    console.log(items);
    let inStock =
      item.stock_quantity - item.quantity_sold - item.quantity_returned;
    if (item.quantity < inStock) {
      item.quantity = Number(item.quantity) + 1;
      console.log(item.quantity);
    }
    items.splice(index, 1, item);
    this.setState({
      cartItem: items,
    });
  }

  decrementCount(item, index) {
    // index will be the key value
    const items = this.state.cartItem;
    if (item.quantity > 1) {
      item.quantity -= 1;
    }
    items.splice(index, 1, item);
    this.setState({
      cartItem: items,
    });
    console.log(this.state.cartItem);
  }

  showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "red" }}>*{msg}</div>);
  };

  onSaveSales = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { cartItem, company, payment_mode, amount_paid, client_id } =
      this.state;

    toast.dismiss();
    toast.configure({ hideProgressBar: true, closeButton: false });

    if (payment_mode == "") {
      this.showToastError("Please Add Payment Mode");
    } else if (client_id == "") {
      this.showToastError("Please Select a client");
    } else if (amount_paid == "") {
      this.showToastError("Please Add Amount Received");
    } else {
      this.saveSales();
    }
  };

  removeFromCart(index) {
    const list = this.state.cartItem;

    list.splice(index, 1);
    this.setState({ cartItem: list });
  }

  saveSales = () => {
    this.setState({ loading: true, saving: true });

    const {
      cartItem,
      payment_mode,
      total_purchase,
      invoice_no,
      client_id,
      due_date,
      amount_paid,
      saving,
      attributes,
    } = this.state;
    console.log(cartItem);
    addSales({
      cart_items: cartItem,
      payment_mode: payment_mode,
      tracking_id: cartItem.tracking_id,
      amount_paid: amount_paid,
      client_id: client_id,
      due_date: due_date,
      invoice_no: invoice_no,
      total_purchase: total_purchase,
    }).then(
      (res) => {
        this.setState({ loading: false, saving: false });

        this.setState({
          cart_details: res.pos_items,
          transaction_id: res.pos_order.transaction_id,
          //payment_mode: res.payment_mode,
          //sold_at: res.sold_at,
          invoice: res.invoice,
          pos_items: res.pos_items,
          cartItem: [],
        });
        console.log(this.state.cart_details);

        localStorage.removeItem("cart");
        this.showToast("Sales has been created");
      },
      (error) => {
        console.log(error);
        this.setState({ loading: false });
      }
    );
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20 }}>{msg}</div>);
  };

  selectQuantity = (quantity) => {
    let text = [];
    for (let i = 1; i <= quantity.length; i++) {
      text.push(
        <option value={i} key={i}>
          {i}
        </option>
      );
    }
    return text;
  };

  totalCartP() {
    const { cartItem, company } = this.state;
    let sum = 0;
    if (company.sell_by_serial_no == 1) {
      for (let i = 0; i < cartItem.length; i += 1) {
        sum +=
          cartItem[i].new_serials !== undefined
            ? cartItem[i].new_serials.length *
              cartItem[i].order.unit_selling_price
            : 0 * cartItem[i].order.unit_selling_price;
      }
      return this.formatCurrency(sum);
    } else {
      for (let i = 0; i < cartItem.length; i += 1) {
        sum +=
          cartItem[i].quantity !== 0
            ? cartItem[i].quantity * cartItem[i].order.unit_selling_price
            : 0 * cartItem[i].order.unit_selling_price;
      }
      return this.formatCurrency(sum);
    }
  }

  clearCart() {
    localStorage.removeItem("cart");
    localStorage.removeItem("cart_sold");
    localStorage.removeItem("cart_details");
    this.setState({
      cartItem: [],
      cartCheckout: [],
      cart_details: [],
      cart_sold: [],
    });
    this.getPurchaseOrders();
  }

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };

  onPage = async (page, rows) => {
    await this.setState({ page, rows });
    await this.getPurchaseOrders();
  };
  getPurchaseOrders = () => {
    const { page, rows, order, search, products } = this.state;
    console.log(order);
    this.setState({ loading: true });
    getBranchStocks({ page, rows, order, search }).then(
      (res) => {
        console.log(res);
        this.setState({
          loading: false,
          stocks: res.stocks.data,
          attributes: res.attributes,
          products: res.products.data,
          total_cost: 0,
          suppliers: res.suppliers.data,
          branches: res.branches.data,
          total: res.stocks.total,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  toggleFilter = () => {
    this.setState({ showFilter: !this.state.showFilter });
  };
  sleep = (ms) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });

  loadOptions = async (search, prevOptions) => {
    options = [];
    var options = this.state.products;
    await this.sleep(1000);

    let filteredOptions;
    if (!search) {
      filteredOptions = options;
    } else {
      const searchLower = search.toLowerCase();

      filteredOptions = options.filter(({ label }) =>
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
      hasMore,
    };
  };

  onFilter = async (e, filter) => {
    console.log(filter);
    await this.setState({ [filter]: e });
    await this.getPurchaseOrders();
  };

  toggleAddToCart = (addToCart) => {
    var items = this.state.cartItem === null ? [] : [...this.state.cartItem];

    var item = items.find((item) => item.id === addToCart.id);

    if (item) {
      item.quantity += 1;
    } else {
      items.push(addToCart);
    }
    console.log(items);
    this.setState({ cartItem: items });
    this.setState({ cartI: items });
    localStorage.setItem("cart", JSON.stringify(items));
  };

  inCart = (cartId) => {
    let inCartIds = this.state.cartItem;

    if (inCartIds !== null && localStorage.getItem("cart") !== null) {
      var result = inCartIds.map((product, key) => {
        return product.id;
      });
      let validateId = result.includes(cartId);

      return validateId;
    } else {
      return false;
    }
  };

  totalCart() {
    if (this.state.cartItem !== null) {
      let total_cart = this.state.cartItem.reduce(function (sum, item) {
        return (sum = sum + item.quantity);
      }, 0);
      return total_cart;
    } else {
      return 0;
    }
  }

  formatCurrency(x) {
    if (x !== null && x !== 0) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `\u20a6${parts.join(".")}`;
    }
    return 0;
  }

  handleSearch = (event) => {
    this.setState({ search: event.target.value }, () => {
      if (this.state.search < 5) {
        this.searchThrottled(this.state.search);
      } else {
        this.searchDebounced(this.state.search);
      }
    });
  };

  handlePriceChange = (event, index) => {
    const newPrice = parseFloat(event.target.value) || 0;
    const updatedCartItems = [...this.state.cartItem];

    updatedCartItems[index].order.unit_selling_price = newPrice;

    this.setState({ cartItem: updatedCartItems });
  };

  render() {
    const {
      stocks,
      company,
      payment_mode,
      rows,
      total,
      clients,
      page,
      cartItem,
      due_date,
      search,
      addClient,
      cart_details,
      pos_items,
      invoice,
      user,
      saving,
    } = this.state;
    return (
      <>
        {cart_details && (
          <div style={{ display: "none" }}>
            <Invoice
              pos_items={pos_items}
              invoice={invoice}
              company={company}
              user={user}
              ref={(el) => (this.componentRef = el)}
              toggle={() => this.setState({ invoice: {} })}
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

        {/* {loading && <SpinDiv text={"Loading..."} />} */}
        <div style={{ margin: 15 }}>
          <Row>
            <Col lg="12">
              <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div className="d-block mb-4 mb-md-0">
                  <Breadcrumb
                    listProps={{
                      className: " breadcrumb-text-dark text-primary",
                    }}
                  >
                    <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                    <Breadcrumb.Item href="#POS">POS</Breadcrumb.Item>
                  </Breadcrumb>
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col lg="7">
              <h6>Stocks({total})</h6>
            </Col>
          </Row>
          <Row></Row>

          <Card border="light" className="shadow-sm mb-4">
            <Row>
              <Col md={8}>
                <Row>
                  <Col md="5" className="">
                    <div style={{ display: "flex" }}>
                      <Input
                        placeholder="Search..."
                        id="show"
                        style={{
                          maxHeight: 45,
                          marginRight: 5,
                          marginBottom: 10,
                        }}
                        value={search}
                        onChange={this.handleSearch}
                        autoFocus
                      />
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col lg={4} style={{ color: "primary", paddingTop: "15px" }}>
                <div className="btn-toolbar mb-2 mb-md-0">
                  <ButtonGroup>
                    {cartItem !== null ? (
                      <div>
                        <Button variant="outline-success" size="sm">
                          Cart({cartItem.length})
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            this.clearCart();
                          }}
                        >
                          Clear Cart
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline-success"
                        onClick={() => {
                          this.props.history.push("/pos_sales");
                        }}
                        size="sm"
                      >
                        View Sales
                      </Button>
                    )}
                    {cart_details.length > 0 ? (
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
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Card.Body className="pb-0">
                  <Table
                    responsive
                    className="table-centered table-nowrap rounded mb-0"
                  >
                    <thead className="thead-light">
                      <tr>
                        <th className="border-0">Code</th>
                        <th className="border-0">Description</th>
                        <th className="border-0">Instock</th>
                        <th className="border-0">Stock</th>
                        <th className="border-0">Price</th>
                        <th className="border-0">Action</th>
                        {/* <th className="border-0">Stock Order ID</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {stocks
                        .filter((stock) => stock.in_stock > 0)
                        .map((stock, key) => {
                          const alreadyAdded = this.inCart(stock.id);

                          return (
                            <tr key={key}>
                              <td>
                                <span style={{ fontWeight: "bold" }}>
                                  {" "}
                                  {stock.tracking}{" "}
                                </span>
                              </td>
                              <td>
                                <span className="mb-0 text-sm">
                                  {stock.product_name + " "}
                                </span>
                              </td>

                              <td>
                                {" "}
                                <span style={{ fontWeight: "bold" }}>
                                  {" "}
                                  {stock.in_stock}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontWeight: "bold" }}>
                                  {stock.stock_quantity}{" "}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontWeight: "bold" }}>
                                  {" "}
                                  {this.formatCurrency(
                                    stock.order.fixed_price
                                  )}{" "}
                                </span>
                              </td>

                              <td>
                                {stock.in_stock <= 0 ? (
                                  <Button disabled color="primary" size="sm">
                                    Out of Stock
                                  </Button>
                                ) : alreadyAdded === false ? (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => this.toggleAddToCart(stock)}
                                  >
                                    <FontAwesomeIcon icon={faPlus} />
                                  </Button>
                                ) : (
                                  <Button color="primary" size="sm" disabled>
                                    <FontAwesomeIcon icon={faCheck} />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                  <Row>
                    <Col md={12} style={{ fontWeight: "bold", paddingTop: 3 }}>
                      {stocks.filter((stock) => stock.in_stock > 0).length >
                      0 ? (
                        <Pagination
                          showSizeChanger
                          defaultCurrent={6}
                          total={total}
                          showTotal={(total) => `Total ${total} Stocks`}
                          onChange={this.onPage}
                          pageSize={rows}
                          current={page}
                        />
                      ) : (
                        <div
                          style={{
                            color: "#ccc",
                            alignSelf: "center",
                            padding: 10,
                            fontSize: 13,
                          }}
                        >
                          <i className="fa fa-ban" style={{ marginRight: 5 }} />
                          No Stock found
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Card.Body className="pb-0">
                  <div className="modal-header" style={{ padding: "1rem" }}>
                    <div className="btn-toolbar mb-2 mb-md-0">
                      <ButtonGroup>
                        {cartItem.length > 0 ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            style={{ fontSize: 22, fontWeight: "bold" }}
                          >
                            Total: {this.totalCartP()}
                          </Button>
                        ) : (
                          ""
                        )}
                      </ButtonGroup>
                    </div>
                  </div>

                  {cart_details.length == 0 ? (
                    <div>
                      <Table responsive className="table-nowrap rounded mb-0">
                        <thead className="thead-light">
                          <tr>
                            <th className="border-0">Product</th>
                            <th className="border-0">Price</th>
                            <th className="border-0">Quantity</th>
                            <th className="border-0">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItem.map((sale, key) => {
                            const alreadyAdded = this.inCart(sale.id);
                            return (
                              <tr>
                                <td>
                                  <Media className="align-items-center">
                                    <span
                                      className="mb-0 text-sm"
                                      style={{
                                        fontWeight: "bold",
                                        fontSize: 15,
                                        paddingLeft: 5,
                                      }}
                                    >
                                      {sale.product_name +
                                        ` X ${sale.quantity}`}
                                      <br />
                                    </span>
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
                                  </Media>
                                </td>

                                <td>
                                  {/* <InputNumber
                                    style={{
                                      width: "auto",
                                      height: 40,
                                      paddingTop: 5,
                                      borderRadius: 5,
                                      fontSize: 18,
                                    }}
                                    value={sale.order.unit_selling_price}
                                    formatter={(value) =>
                                      `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                      )
                                    }
                                    parser={(value) =>
                                      value.replace(/\$\s?|(,*)/g, "")
                                    }
                                    onKeyPress={(event) => {
                                      if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                      }
                                    }}
                                    onChange={(event) =>
                                      this.handlePriceChange(event, key)
                                    }
                                  /> */}
                                  <input
                                    style={{
                                      width: "auto",
                                      height: 40,
                                      paddingTop: 5,
                                      borderRadius: 5,
                                      fontSize: 18,
                                    }}
                                    onKeyPress={(event) => {
                                      if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                      }
                                    }}
                                    parser={(value) =>
                                      value.replace(/\$\s?|(,*)/g, "")
                                    }
                                    value={sale.order.unit_selling_price}
                                    onChange={(event) =>
                                      this.handlePriceChange(event, key)
                                    }
                                  />
                                </td>
                                <td>
                                  {" "}
                                  <div>
                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      onClick={() =>
                                        this.decrementCount(sale, key)
                                      }
                                    >
                                      -
                                    </Button>

                                    <span style={{ padding: "10px" }}>
                                      {sale.quantity}
                                    </span>

                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      onClick={() =>
                                        this.incrementCount(sale, key)
                                      }
                                    >
                                      +
                                    </Button>
                                  </div>
                                </td>

                                <td>
                                  {sale.quantity *
                                    sale.order.unit_selling_price}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                      <Table style={{ border: "none" }}>
                        <tr>
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
                              <AsyncPaginate
                                onChange={this.handleClientChange}
                                loadOptions={this.loadClients(clients)}
                                additional={{
                                  page: 1,
                                }}
                              />
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
                        </tr>
                        <tr>
                          {cartItem.length > 0 && (
                            <Row
                              style={{
                                border: "1px #eee solid",
                                padding: "10px 5px 0px",
                                margin: "20px 15px",
                                borderRadius: 7,
                              }}
                            >
                              <Col md={4}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Amount Received</Form.Label>
                                  <InputGroup>
                                    <InputGroup.Text>
                                      {/* {currency} */}
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
                                        `${value}`.replace(
                                          /\B(?=(\d{3})+(?!\d))/g,
                                          ","
                                        )
                                      }
                                      parser={(value) =>
                                        value.replace(/\$\s?|(,*)/g, "")
                                      }
                                      onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                          event.preventDefault();
                                        }
                                      }}
                                      onChange={(e) =>
                                        this.onChange(e, "amount_paid")
                                      }
                                    />
                                    {/* {submitted && this.state.amount_paid > this.totalCost() && (
                                                    <div style={{ color: "red" }}>Amount received is more than total Cost</div>
                                                )} */}
                                  </InputGroup>
                                </Form.Group>
                              </Col>
                              <Col md="4" style={{ marginBottom: 20 }}>
                                <FormGroup className="form-date">
                                  <Form.Label> Due Date</Form.Label>
                                  <ReactDatetime
                                    value={due_date}
                                    dateFormat={"MMM D, YYYY"}
                                    closeOnSelect
                                    onChange={(e) =>
                                      this.onChange(e, "due_date")
                                    }
                                    inputProps={{
                                      required: true,
                                      className: "form-control date-width",
                                    }}
                                    timeFormat={false}
                                  />
                                </FormGroup>
                              </Col>
                              <Col md={4}>
                                <Form.Group>
                                  <Form.Label>Mode of payment</Form.Label>

                                  <Form.Select
                                    required
                                    name="payment_mode"
                                    value={payment_mode}
                                    onChange={(e) =>
                                      this.onChange(
                                        e.target.value,
                                        "payment_mode"
                                      )
                                    }
                                    style={{
                                      marginRight: 10,
                                      width: "100%",
                                    }}
                                  >
                                    <option value="">
                                      Select payment mode
                                    </option>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="transfer">Transfer</option>
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                            </Row>
                          )}
                        </tr>
                        <tr className="border-0">
                          <td></td>
                        </tr>
                      </Table>
                      <Table
                        responsive
                        className="table-centered table-nowrap rounded mb-0"
                      >
                        <tr className="border-0" style={{ border: "none" }}>
                          <td>
                            <div>
                              {cartItem.length > 0 ? (
                                <div>
                                  <Button
                                    variant="outline-primary"
                                    type="submit"
                                    disabled={saving}
                                    onClick={this.onSaveSales}
                                  >
                                    Checkout
                                  </Button>
                                </div>
                              ) : (
                                ""
                              )}
                            </div>
                          </td>
                        </tr>
                      </Table>
                    </div>
                  ) : (
                    <Row>
                      <Col md={2}></Col>
                      <Col md={8}>
                        <h5>
                          Sales has been completed, Print Invoice by clicking on
                          the Button above
                        </h5>
                      </Col>
                      <Col md={2}></Col>
                    </Row>
                  )}
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </div>
      </>
    );
  }
}

export default PosOrderIndex;
