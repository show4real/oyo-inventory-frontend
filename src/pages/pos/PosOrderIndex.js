import React, { Component } from "react";
import { Input, Media } from "reactstrap";
import { toast } from "react-toastify";
import {
  Col,
  Row,
  Card,
  Table,
  Button,
  ButtonGroup,
  Breadcrumb,
  Form,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { throttle, debounce } from "../debounce";
import { addSales } from "../../services/posOrderService";
import ReactToPrint from "react-to-print";
import { Invoice } from "./Invoice";
import { Pagination, Select, Spin } from "antd";
import { getBranchStocks } from "../../services/stockService";
import { getCompany } from "../../services/companyService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import { getAllClients, getInvoiceId } from "../../services/invoiceService";
import AddClient from "../clients/AddClient";
import moment from "moment";
import { InputNumber } from "antd";
import { getClients } from "../../services/clientService";

const { Option } = Select;

export class PosOrderIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      search_client: "",
      page: 1,
      rows: 20,
      loading: false,
      saving: false,
      stocks: [],
      cart_details: [],
      clients: [],
      transaction_id: "",
      products: [],
      total_cost: 0,
      invoice_no: "",
      total: 0,
      total_cart: 0,
      close: false,
      cartItem: [],
      payment_mode: "",
      amount_paid: 0,
      client_id: "",
      total_purchase: 0,
      user: JSON.parse(localStorage.getItem("user")),
      company: {},
      due_date: moment().startOf("month"),
      invoice: {},
      pos_items: [],
      total_balance: 0,
      prev_balance: 0,
      loading: false,
    };

    this.searchDebounced = debounce(this.getPurchaseOrders, 500);
    this.searchThrottled = throttle(this.getPurchaseOrders, 500);
  }

  componentDidMount() {
    this.getPurchaseOrders();
    this.getCompany();
    this.getClients();
    this.getInvoiceId();

    const savedCartItem = JSON.parse(localStorage.getItem("cartItem")) || [];
    this.setState({ cartItem: savedCartItem });
  }

  getClients = () => {
    const { page, rows, search, clients, search_client } = this.state;
    this.setState({ loading: true });
    getClients({ page, rows, search: search_client }).then(
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
    this.setState(
      { search_client: value, page: 1, clients: [], hasMore: true },
      () => this.getClients()
    );
  };

  handleClientChange = (selected) => {
    this.setState({
      client_id: selected.value,
    });
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

    this.setState({ cartItem: items }, this.updateCartItemInLocalStorage);
  }

  decrementCount(item, index) {
    // index will be the key value
    const items = this.state.cartItem;
    if (item.quantity > 1) {
      item.quantity -= 1;
    }
    items.splice(index, 1, item);
    this.setState({ cartItem: items }, this.updateCartItemInLocalStorage);
  }

  showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "red" }}>*{msg}</div>);
  };

  onSaveSales = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { cartItem, company, payment_mode, amount_paid, client_id } =
      this.state;

    let check_quantity =
      cartItem.some((ele) => ele.quantity === 0) ||
      cartItem.some((ele) => ele.quantity === undefined);

    toast.dismiss();
    toast.configure({ hideProgressBar: true, closeButton: false });

    if (check_quantity) {
      this.showToastError("Please Select Quantity");
    } else if (payment_mode == "") {
      this.showToastError("Please Add Payment Mode");
    } else if (client_id == "") {
      this.showToastError("Please Select a client");
    } else {
      this.saveSales();
    }
  };

  removeFromCart(index) {
    const list = this.state.cartItem;

    list.splice(index, 1);
    this.setState({ cartItem: list }, this.updateCartItemInLocalStorage);
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
    } = this.state;
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
          invoice: res.invoice,
          pos_items: res.pos_items,
          total_balance: res.total_balance,
          prev_balance: res.prev_balance,
          cartItem: [],
        });
        this.showToast("Sales has been created");
        localStorage.removeItem("cartItem");
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
    this.setState({
      cartItem: [],
      cart_details: [],
    });
    this.getPurchaseOrders();
    localStorage.removeItem("cartItem");
  }

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };

  onPage = async (page, rows) => {
    await this.setState({ page, rows });
    await this.getPurchaseOrders();
  };
  getPurchaseOrders = () => {
    const { page, rows, order, search } = this.state;
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

  updateCartItemInLocalStorage = () => {
    localStorage.setItem("cartItem", JSON.stringify(this.state.cartItem));
  };

  toggleAddToCart = (addToCart) => {
    var items = this.state.cartItem === null ? [] : [...this.state.cartItem];

    var item = items.find((item) => item.id === addToCart.id);

    if (item) {
      item.quantity += 1;
    } else {
      items.push(addToCart);
    }
    this.setState({ cartItem: items }, this.updateCartItemInLocalStorage);
  };

  inCart = (cartId) => {
    let inCartIds = this.state.cartItem;

    if (inCartIds !== null) {
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

    this.setState(
      { cartItem: updatedCartItems },
      this.updateCartItemInLocalStorage
    );
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
      total_balance,
      prev_balance,
      invoice,
      user,
      saving,
      loading,
    } = this.state;
    return (
      <>
        {cart_details && (
          <div style={{ display: "none" }}>
            <Invoice
              pos_items={pos_items}
              invoice={invoice}
              company={company}
              total_balance={total_balance}
              prev_balance={prev_balance}
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
        <div style={{ margin: 10 }}>
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
                    <Breadcrumb.Item href="/invoices">Invoices</Breadcrumb.Item>
                    <Breadcrumb.Item href="#">POS</Breadcrumb.Item>
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
              <Col md={4} style={{ color: "primary", paddingTop: "15px" }}>
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
              <Col md={6}>
                <Card.Body className="pb-0">
                  <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    <Table
                      responsive
                      className="table-centered table-nowrap rounded mb-0"
                    >
                      <thead className="thead-light">
                        <tr>
                          <th className="border-0">Description</th>

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
                                    {stock.product_name + " "}
                                  </span>
                                  <div>
                                    <span style={{ fontSize: 15, padding: 10 }}>
                                      {" "}
                                      Code: {stock.tracking}{" "}
                                    </span>
                                    <span style={{ fontSize: 15, padding: 10 }}>
                                      {" "}
                                      In Stock: {stock.in_stock}
                                      <br />
                                    </span>
                                    <span style={{ fontSize: 15, padding: 10 }}>
                                      Total Stock: {stock.stock_quantity}{" "}
                                    </span>
                                  </div>
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
                                      onClick={() =>
                                        this.toggleAddToCart(stock)
                                      }
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
                  </div>
                  <Row>
                    <Col md={12} style={{ fontWeight: "bold", paddingTop: 30 }}>
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
              <Col md={6}>
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
                    <>
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        <Table responsive className="table-nowrap rounded mb-0">
                          <thead className="thead-light">
                            <tr>
                              <th className="border-0">Product</th>
                              <th className="border-0">Price</th>

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
                                          color: "red",
                                          borderColor: "red",
                                          marginLeft: 10,
                                        }}
                                        onClick={() => this.removeFromCart(key)}
                                      >
                                        <i className="fa fa-trash" />
                                      </Button>
                                      &nbsp; &nbsp; &nbsp; &nbsp;
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
                                    </Media>
                                  </td>

                                  <td>
                                    <input
                                      style={{
                                        width: 100,
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
                                    {sale.quantity *
                                      sale.order.unit_selling_price}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                      <div>
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
                              <Col md={4}>
                                <Form.Label>Clients</Form.Label>
                                <Select
                                  showSearch
                                  labelInValue
                                  placeholder="Search Clients"
                                  filterOption={false}
                                  onSearch={this.handleSearchClient}
                                  onPopupScroll={this.handlePopupScroll}
                                  onChange={this.handleClientChange}
                                  notFoundContent={
                                    loading ? <Spin size="small" /> : null
                                  }
                                  style={{ width: "100%" }}
                                >
                                  {clients.map((client) => (
                                    <Option key={client.id} value={client.id}>
                                      {client.name}
                                    </Option>
                                  ))}
                                </Select>
                              </Col>
                              <Col md={4}>
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
                          </tr>
                          <tr>
                            {cartItem.length > 0 && (
                              <Row
                                style={{
                                  border: "1px #eee solid",
                                  padding: "10px 5px 0px",
                                  margin: "10px 15px",
                                  borderRadius: 7,
                                }}
                              >
                                <Col md={4}>
                                  <Form.Group className="mb-2">
                                    <Form.Label>Amount Received</Form.Label>
                                    <InputGroup>
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
                                    </InputGroup>
                                  </Form.Group>
                                </Col>
                                <Col md={2}></Col>
                                <Col md={4}>
                                  <div style={{ paddingTop: 30 }}>
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
                                </Col>
                              </Row>
                            )}
                          </tr>
                        </Table>
                      </div>
                    </>
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
            <Row></Row>
          </Card>
        </div>
      </>
    );
  }
}

export default PosOrderIndex;
