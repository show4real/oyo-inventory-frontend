import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "reactstrap";
import {
  getAllPurchaseOrders,
  addPurchaseorder,
} from "../../services/purchaseOrderService";
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
} from "@themesberg/react-bootstrap";

import Profile3 from "../../assets/img/team/profile-picture-3.jpg";
import SpinDiv from "../components/SpinDiv";
import axios from "axios";
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";
import { counter } from "@fortawesome/fontawesome-svg-core";
import { Cart } from "../products/Cart";
import AsyncSelect from "react-select/async";
import AddStock from "./AddStock";
import EditStock from "./EditStock";
import moment from "moment";
import "antd/dist/antd.css";
import { Pagination } from "antd";
import { formatCurrency, format } from "../../services/formatCurrencyService";
import ReactDatetime from "react-datetime";

export class StockIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      purchase_orders: [],
      total_cost: [],
      products: [],
      p: [],
      branch: "",
      branches: [],
      order: "",
      value: "",
      total: 0,
      total_cart: 0,
      cartItem: [],
      options: [],
      fromdate: moment().startOf("month"),
      todate: moment().endOf("day"),
    };
    //this.handleChange = this.handleChange.bind(this);
    this.cartItem = JSON.parse(localStorage.getItem("cart"));
    this.setState({ cartItem: this.cartItem });
  }

  componentDidMount() {
    this.getPurchaseOrders();
    this.cartItem = localStorage.removeItem("cart");
  }

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };

  formatNumber = (number) => {
    return format(number);
  };

  getPurchaseOrders = () => {
    const { page, rows, order, search, branch, products, fromdate, todate } =
      this.state;
    console.log(order);
    console.log(branch);
    this.setState({ loading: true });
    getAllPurchaseOrders({
      page,
      rows,
      order,
      branch,
      search,
      fromdate,
      todate,
    }).then(
      (res) => {
        console.log(res);
        this.setState({
          loading: false,
          purchase_orders: res.purchase_orders.data,
          attributes: res.attributes,
          products: res.products,

          p: res.products.map((opt) => ({ label: opt.name, value: opt.id })),
          suppliers: res.suppliers,
          branches: res.branches,
          total_cost: res.total_purchase,
          total: res.purchase_orders.total,
          initialPurchaseOrders: { ...res.purchase_orders.data },
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter,
      products: this.state.products,
    });
  };

  handleChange = async (value) => {
    console.log(value);
    this.setState({
      value: value,
      order: value.value,
    });
    this.getPurchaseOrders();
  };

  onFilter = async (e, filter) => {
    if (filter === "order") {
      await this.setState({ branch: "" });
    }
    await this.setState({ [filter]: e });
    await this.getPurchaseOrders();
  };

  toggleAddToCart = (addToCart) => {
    var items = this.state.cartItem === null ? [] : [...this.state.cartItem];
    var item = items.find((item) => item.id === addToCart.id);
    console.log(item);

    if (item) {
      item.quantity += 1;
    } else {
      items.push(addToCart);
    }
    this.setState({ cartItem: items });
    localStorage.setItem("cart", JSON.stringify(items));
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

  toggleCart = (cartCheckout) => {
    this.setState({ cartCheckout });
  };

  toggleAddStock = () => {
    this.setState({ addStock: !this.state.addStock });
  };

  toggleEditStock = () => {
    this.setState({ editStock: !this.state.editStock });
  };
  toggleAddCategory = () => {
    this.setState({ addCategories: !this.state.addCategories });
  };

  toggleAddBrand = () => {
    this.setState({ addBrands: !this.state.addBrands });
  };

  filterProduct = (inputValue) => {
    return this.state.p.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  loadOptions = (inputValue, callback) => {
    setTimeout(() => {
      callback(this.filterProduct(inputValue));
    }, 1000);
  };

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  formatC = (x) => {
    return formatCurrency(x);
  };

  render() {
    const {
      purchase_orders,
      value,
      order,
      products,
      attributes,
      showFilter,
      total,
      addStock,
      editStock,
      suppliers,
      branches,
      total_cart,
      page,
      p,
      cartCheckout,
      cartItem,
      rows,
      search,
      loading,
      branch,
      addToCart,
      total_cost,
      fromdate,
      todate,
    } = this.state;
    return (
      <>
        {addStock && (
          <AddStock
            saved={this.getPurchaseOrders}
            addStock={addStock}
            products={products}
            suppliers={suppliers}
            branches={branches}
            toggle={() => this.setState({ addStock: null })}
          />
        )}

        {editStock && (
          <EditStock
            saved={this.getPurchaseOrders}
            editStock={editStock}
            products={products}
            suppliers={suppliers}
            toggle={() => this.setState({ editStock: null })}
          />
        )}

        {loading && <SpinDiv text={"Loading..."} />}
        {console.log(order)}
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
                  <Breadcrumb.Item href="#Purchase orders">
                    Purchase Order
                  </Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => this.toggleAddStock()}
                  >
                    Create Purchase Order
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      this.props.history.push("/products");
                    }}
                  >
                    Products
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg="7">
            <Row>
              <Col md={5}>
                <h6>Purchase Orders ({total})</h6>
              </Col>
              <Col md={3}>
                <ReactDatetime
                  value={fromdate}
                  dateFormat={"MMM D, YYYY"}
                  closeOnSelect
                  onChange={(e) => this.onFilter(e, "fromdate")}
                  inputProps={{
                    required: true,
                    className: "form-control date-filter",
                  }}
                  isValidDate={(current) => {
                    return (
                      (current.isBefore(todate) || current.isSame(todate)) &&
                      current.isBefore(moment())
                    );
                  }}
                  timeFormat={false}
                />
              </Col>

              <Col md={3}>
                <ReactDatetime
                  value={todate}
                  dateFormat={"MMM D, YYYY"}
                  closeOnSelect
                  onChange={(e) => this.onFilter(e, "todate")}
                  inputProps={{
                    required: true,
                    className: "form-control date-filter",
                  }}
                  isValidDate={(current) => {
                    return (
                      (current.isAfter(fromdate) || current.isSame(fromdate)) &&
                      current.isBefore(moment())
                    );
                  }}
                  timeFormat={false}
                />
              </Col>
            </Row>
          </Col>
          <Col lg="1">
            {!showFilter && (
              <div style={{ display: "flex" }}>
                <Button
                  color="warning"
                  onClick={this.toggleFilter}
                  value={products}
                  onChange={(e) => this.onChange(e.target.value, "p")}
                  size="sm"
                  style={{ marginRight: 10 }}
                >
                  Filter
                </Button>
              </div>
            )}
          </Col>
          <Col lg="4" className="">
            <div style={{ display: "flex" }}>
              <Input
                placeholder="Search..."
                id="show"
                style={{ maxHeight: 45, marginRight: 5, marginBottom: 10 }}
                value={search}
                onChange={(e) => this.onChange(e.target.value, "search")}
                autoFocus
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    this.getPurchaseOrders();
                    this.setState({
                      search: "",
                    });
                  }
                }}
              />
              <Button
                className="btn-icon btn-2"
                color="secondary"
                style={{ maxHeight: 45 }}
                size="sm"
                onClick={this.getPurchaseOrders}
              >
                <i className="fa fa-search" />
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          {showFilter && (
            <Col md={12}>
              <Row>
                <Col md={4}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: 10, fontSize: 14 }}>
                      Filter By product:{" "}
                    </span>

                    <Form.Select
                      value={order}
                      type="select"
                      style={{ marginRight: 10, width: "fit-content" }}
                      onChange={(e) => this.onFilter(e.target.value, "order")}
                    >
                      <option value="">All Product</option>
                      {products.map((p, index) => (
                        <option value={p.id} key={p}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </Col>
                <Col md={4}>
                  <Button
                    color="warning"
                    onClick={async () => {
                      this.toggleFilter();
                      await this.setState({ branch: "", order: "" });
                      this.getPurchaseOrders();
                    }}
                    size="sm"
                    style={{ marginRight: 10 }}
                  >
                    Hide Filters
                  </Button>
                </Col>
              </Row>
            </Col>
          )}
        </Row>

        <Card border="light" className="shadow-sm mb-4">
          <Row>
            <div
              className="btn-toolbar mb-2 mb-md-0"
              style={{ padding: "20px" }}
            >
              <ButtonGroup>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => this.toggleAddStock()}
                >
                  Create Purchase Order
                </Button>
              </ButtonGroup>
            </div>
          </Row>
          <Row>
            <Col lg="11">
              <div
                style={{
                  fontSize: "18px",
                  paddingTop: "20px",
                  color: "red",
                  paddingLeft: "10px",
                  fontWeight: "bold",
                }}
              >
                Total Purchase Order Cost:&nbsp;&#8358;
                {total_cost.map((total, key) => {
                  return total.total !== null
                    ? total.total
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "----";
                })}
              </div>
            </Col>
          </Row>
          <Card.Body className="pb-0">
            <Table
              responsive
              className="table-centered table-nowrap rounded mb-0"
            >
              <thead className="thead-light">
                <tr>
                  <th className="border-0">Product</th>
                  <th className="border-0">Supplier</th>
                  <th className="border-0">Purchase Order ID</th>

                  <th className="border-0">Purchase Order unit</th>
                  <th className="border-0">Unit Price</th>
                  <th className="border-0">Total cost</th>
                  <th className="border-0">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchase_orders.map((purchase_order, key) => {
                  const alreadyAdded = this.inCart(purchase_order.id);
                  return (
                    <tr key={key} style={{ fontWeight: "bold" }}>
                      <td>{purchase_order.product_name}</td>
                      <td>{purchase_order.supplier.name}</td>
                      <td>{purchase_order.tracking_id}</td>
                      <td>
                        {this.formatNumber(purchase_order.stock_quantity)}
                      </td>
                      <td>{this.formatC(purchase_order.unit_price)}</td>
                      <td>
                        {this.formatC(
                          purchase_order.stock_quantity *
                            purchase_order.unit_price
                        )}
                      </td>
                      <td>
                        {moment(purchase_order.created_at).format(
                          "MMM D, YYYY"
                        )}
                      </td>

                      <td>
                        {purchase_order.status == "Confirmed" ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              //console.log('111')
                              this.props.history.push(
                                "/purchase_order/" +
                                  purchase_order.id +
                                  "/product/" +
                                  purchase_order.product_id
                              );
                            }}
                          >
                            View stock
                          </Button>
                        ) : (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              //console.log('111')
                              this.props.history.push(
                                "/purchase_order/" +
                                  purchase_order.id +
                                  "/product/" +
                                  purchase_order.product_id
                              );
                            }}
                          >
                            confirm stock
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
                {purchase_orders.length < 1 && (
                  <div
                    style={{
                      color: "#ccc",
                      alignSelf: "center",
                      padding: 10,
                      fontSize: 13,
                    }}
                  >
                    <i className="fa fa-ban" style={{ marginRight: 5 }} />
                    No Stock for the date Range
                  </div>
                )}
                {purchase_orders.length > 0 && (
                  <Pagination
                    total={total}
                    showTotal={(total) => `Total ${total} orders`}
                    onChange={this.onPage}
                    pageSize={rows}
                    current={page}
                  />
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default StockIndex;
