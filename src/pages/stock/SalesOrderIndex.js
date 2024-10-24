import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "reactstrap";
import {
  getSales,
  addPurchaseorder,
} from "../../services/purchaseOrderService";
import { toast } from "react-toastify";
import Cart from "../products/Cart";
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
import { AsyncPaginate } from "react-select-async-paginate";
import AddStock from "./AddStock";
import AddSales from "./AddSales";
import EditStock from "./EditStock";
//import AddStock from "../products/AddStock";

export class SalesOrderIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      sales: [],
      products: [],
      total_sales: [],
      order: "",
      value: "",
      total: 0,
      total_cart: 0,
      cartItem: [],
      options: [],
    };
    this.cartItem = JSON.parse(localStorage.getItem("cart"));
    this.setState({ cartItem: this.cartItem });
  }

  componentDidMount() {
    this.getSalesOrders();
    localStorage.removeItem("cart");
  }

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };
  getSalesOrders = () => {
    const { page, rows, order, search, products } = this.state;
    console.log(order);
    this.setState({ loading: true });
    getSales({ page, rows, order, search }).then(
      (res) => {
        console.log(res);
        this.setState({
          loading: false,
          sales: res.sales_orders.data,
          products: res.products,
          total_sales: res.total_sales,
          suppliers: res.suppliers,
          branches: res.branches,
          total: res.sales_orders.total,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  formatCurrency(x) {
    if (x !== "null" && x !== "0") {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `\u20a6${parts.join(".")}`;
    }
    return "0";
  }

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
    var options = this.state.products.map((product, key) => {
      return {
        value: product.id,
        label: product.name,
      };
    });
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
  handleChange = async (value) => {
    console.log(value);
    this.setState({
      value: value,
      order: value.value,
    });
    this.getSalesOrders();
  };

  onFilter = async (e, filter) => {
    console.log(filter);
    await this.setState({ [filter]: e });
    await this.getSalesOrders();
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

  toggleCart = (cartCheckout) => {
    this.setState({ cartCheckout });
  };

  toggleAddStock = () => {
    this.setState({ addStock: !this.state.addStock });
  };

  toggleAddSales = (addSales) => {
    this.setState({ addSales });
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

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  render() {
    const {
      sales,
      value,
      order,
      products,
      attributes,
      showFilter,
      total,
      total_sales,
      addStock,
      addSales,
      editStock,
      suppliers,
      branches,
      total_cart,
      page,
      cartCheckout,
      cartItem,
      rows,
      search,
      loading,
      addToCart,
    } = this.state;
    return (
      <>
        {addStock && (
          <AddStock
            saved={this.getSalesOrders}
            addStock={addStock}
            products={products}
            suppliers={suppliers}
            branches={branches}
            toggle={() => this.setState({ addStock: null })}
          />
        )}

        {addSales && (
          <AddSales
            saved={this.getSalesOrders}
            addSales={addSales}
            toggle={() => this.setState({ addSales: null })}
          />
        )}

        {editStock && (
          <EditStock
            saved={this.getSalesOrders}
            editStock={editStock}
            products={products}
            suppliers={suppliers}
            toggle={() => this.setState({ editStock: null })}
          />
        )}
        {cartCheckout && (
          <Cart
            saved={this.getSalesOrders}
            cartCheckout={cartCheckout}
            toggle={() => this.setState({ cartCheckout: null })}
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
                  <Breadcrumb.Item href="#products">products</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
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
          <div className="btn-toolbar mb-2 mb-md-0"></div>
          <Col lg="7">
            <h6>sales({total})</h6>
            {/*<AsyncPaginate
        value={order}
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
            />*/}
          </Col>
          <Col lg="1">
            {!showFilter && (
              <div style={{ display: "flex" }}>
                <Button
                  color="warning"
                  onClick={this.toggleFilter}
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
                    this.getSalesOrders();
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
                onClick={this.getSalesOrders}
              >
                <i className="fa fa-search" />
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          {showFilter && (
            <div
              style={{
                height: 50,
                borderTop: "0.5px solid #e9ecef",
                padding: "0 0 0 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                overflowX: "auto",
              }}
            >
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
                  <option value="">Select Product</option>
                  {products.map((p, index) => (
                    <option value={p.id} key={p}>
                      {p.name}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <Button
                color="warning"
                onClick={this.toggleFilter}
                size="sm"
                style={{ marginRight: 10 }}
              >
                Hide Filters
              </Button>
            </div>
          )}
        </Row>

        <Card border="light" className="shadow-sm mb-4">
          <Row>
            <Col lg="11">
              <div
                style={{
                  fontSize: "18px",
                  paddingTop: "20px",
                  color: "green",
                  paddingLeft: "10px",
                  fontWeight: "bold",
                }}
              >
                Total Sold:&nbsp;&#8358;
                {total_sales.map((total, key) => {
                  return total.total !== null
                    ? total.total
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "----";
                })}
              </div>
            </Col>
            <Col lg="1" style={{ color: "primary", paddingTop: "15px" }}>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  <Button
                    variant="outline-success"
                    onClick={() => this.toggleCart(cartItem)}
                    size="sm"
                  >
                    Sales({cartItem.length})
                  </Button>
                </ButtonGroup>
              </div>
              {/*count(addToCart)*/}
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
                  <th className="border-0">Stock Order ID</th>

                  <th className="border-0">Stock Order unit</th>
                  <th className="border-0">Quantity Sold</th>
                  <th className="border-0">Instock</th>
                  <th className="border-0">Unit cost</th>
                  <th className="border-0">Unit Selling Price</th>
                  <th className="border-0">Total Sold</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, key) => {
                  const alreadyAdded = this.inCart(sale.id);
                  return (
                    <tr key={key}>
                      <td>{sale.product_name}</td>
                      <td>{sale.tracking_id}</td>

                      <td>{sale.stock_quantity}</td>
                      <td>{sale.quantity_sold}</td>
                      <td>{sale.in_stock}</td>
                      <td>{this.formatCurrency(sale.unit_price)}</td>
                      <td>{this.formatCurrency(sale.unit_selling_price)}</td>
                      <td>
                        {this.formatCurrency(
                          sale.quantity_sold * sale.unit_selling_price
                        )}
                      </td>
                      <td>
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() => this.toggleCart(cartItem)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default SalesOrderIndex;
