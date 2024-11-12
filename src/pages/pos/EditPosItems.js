import React, { Component } from "react";
import { Input, Media } from "reactstrap";
import { getStock } from "../../services/purchaseOrderService";
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
import { addSales, editSales } from "../../services/posOrderService";
import ReactToPrint from "react-to-print";
import { Invoice } from "./Invoice";
import { getBranchStocks, getBranchStocks2 } from "../../services/stockService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import AddClient from "../clients/AddClient";
import moment from "moment";
import { InputNumber, Pagination, Select, Spin } from "antd";
import { getCompany } from "../../services/companyService";
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
      sales: [],
      clients: [],
      invoice_last_id: "",
      transaction_id: "",
      sold_at: "",
      created_at: "",
      products: [],
      total_cost: [],
      order: "",
      value: "",
      total: 0,
      total_cart: 0,
      close: false,
      cartItem: [],
      options: [],
      serials2: [],
      payment_mode: "",
      amount_paid: 0,
      client_id: "",
      selectedClient: { value: "", label: "" },
      total_purchase: 0,
      user: JSON.parse(localStorage.getItem("user")),
      company: {},
      due_date: moment().startOf("month"),
      invoice: {},
      pos_items: [],
      stock_pos_items: [],
      total_balance: 0,
      loading: false,
      invoice_id: props.match.params.id,
      prev_balance: 0,
    };

    this.searchDebounced = debounce(this.getPurchaseOrders, 500);
    this.searchThrottled = throttle(this.getPurchaseOrders, 500);
  }

  componentDidMount() {
    this.getPurchaseOrders();
    this.getClients();
    this.getCompany();
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

  getCompany = () => {
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

  handleClientChange = (selected) => {
    this.setState({
      selectedClient: selected,
      client_id: selected.value,
    });
  };

  toggleAddClient = () => {
    this.setState({ addClient: !this.state.addClient });
  };

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  incrementCount(item, index) {
    const items = this.state.cartItem;
    console.log(items);
    let inStock =
      item.stock_quantity - item.quantity_sold - item.quantity_returned;
    if (item.quantity < inStock) {
      item.quantity = Number(item.quantity) + 1;
      console.log(item.quantity);
    }
    items.splice(index, 1, item);
    this.setState({ cartItem: items });
  }

  decrementCount(item, index) {
    const items = this.state.cartItem;
    if (item.quantity > 1) {
      item.quantity -= 1;
    }
    items.splice(index, 1, item);

    this.setState({ cartItem: items });
  }

  showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "red" }}>*{msg}</div>);
  };

  onSaveSales = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { cartItem, payment_mode, amount_paid, client_id } = this.state;
    console.log(client_id);

    let check_qty =
      cartItem.some((ele) => ele.quantity === 0) ||
      cartItem.some((ele) => ele.quantity === undefined);

    toast.dismiss();
    toast.configure({ hideProgressBar: true, closeButton: false });

    if (check_qty) {
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
    this.setState({ cartItem: list });
  }

  saveSales = () => {
    this.setState({ loading: true, saving: true });

    const {
      cartItem,
      payment_mode,
      total_purchase,
      client_id,
      due_date,
      amount_paid,
      invoice_id,
    } = this.state;
    editSales({
      cart_items: cartItem,
      payment_mode: payment_mode,
      tracking_id: cartItem.tracking_id,
      amount_paid: amount_paid,
      client_id: client_id,
      due_date: due_date,
      total_purchase: total_purchase,
      invoice_id: invoice_id,
    }).then(
      (res) => {
        this.setState({ loading: false, saving: false });

        this.setState({
          sales: res.pos_items,
          transaction_id: res.pos_order.transaction_id,
          invoice: res.invoice,
          pos_items: res.pos_items,
          total_balance: res.total_balance,
          prev_balance: res.prev_balance,
          cartItem: [],
        });

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

  totalCartP() {
    const { cartItem, company } = this.state;
    let sum = 0;
    for (let i = 0; i < cartItem.length; i += 1) {
      sum +=
        cartItem[i].quantity !== 0
          ? cartItem[i].quantity * cartItem[i].order.unit_selling_price
          : 0 * cartItem[i].order.unit_selling_price;
    }
    console.log(cartItem);
    return this.formatCurrency(sum);
  }

  clearCart() {
    this.setState({
      cartItem: [],
      sales: [],
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

  updateCartItemInLocalStorage = () => {
    localStorage.setItem("cartItem", JSON.stringify(this.state.cartItem));
  };

  getPurchaseOrders = () => {
    const { page, rows, order, search, invoice_id } = this.state;

    this.setState({ loading: true });
    getBranchStocks2({ page, rows, order, search, invoice_id }).then(
      (res) => {
        this.setState({
          loading: false,
          stocks: res.stocks.data,
          cartItem: res.sold_stocks,
          amount_paid: res.prev_invoice.amount_paid,
          payment_mode: res.prev_invoice.payment_mode,
          client_id: res.prev_invoice.client_id,
          selectedClient: {
            value: res.prev_invoice.client_id,
            label: res.prev_invoice.client_name,
          },
          total_cost: 0,
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

  onFilter = async (e, filter) => {
    console.log(filter);
    await this.setState({ [filter]: e });
    await this.getPurchaseOrders();
  };

  toggleAddToCart = (addToCart) => {
    var items = this.state.cartItem === null ? [] : [...this.state.cartItem];
    items.push(addToCart);
    this.setState({ cartItem: items });
  };

  inCart = (cartId) => {
    let inCartIds = this.state.cartItem;

    if (inCartIds !== null) {
      var result = inCartIds.map((stock, key) => {
        return stock.id;
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
      sales,
      pos_items,
      total_balance,
      invoice,
      user,
      saving,
      loading,
      selectedClient,
      amount_paid,
      prev_balance,
    } = this.state;
    return (
      <>
        {sales && (
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
                    <Breadcrumb.Item href="/pos">New POS</Breadcrumb.Item>
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
                    {cartItem !== null && (
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
                    )}
                    {sales.length > 0 ? (
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

                  {sales.length == 0 ? (
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
                                <div>
                                  <Form.Group className="mb-2">
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
                                      value={selectedClient}
                                    >
                                      {clients.map((client) => (
                                        <Option
                                          key={client.id}
                                          value={client.id}
                                          label={client.name}
                                        >
                                          {client.name}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Group>
                                </div>
                              </Col>
                              <Col md={4} style={{ paddingTop: 40 }}>
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
                                        value={amount_paid}
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
