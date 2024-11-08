import React, { Component } from "react";
import { Input, Media } from "reactstrap";
import { getStock } from "../../services/purchaseOrderService";
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
import SpinDiv from "../components/SpinDiv";
import AddStock from "./AddStock";
import AddSales from "./AddSales";
import EditStock from "./EditStock";
import { Invoice } from "./Invoice";
//import AddStock from "../products/AddStock";
import { Pagination } from "antd";

export class StockIndex2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      stocks: [],
      products: [],
      total_cost: [],
      order: "",
      value: "",
      total: 0,
      total_cart: 0,
      cartItem: JSON.parse(localStorage.getItem("cart")),
      options: [],
      cart_sold: JSON.parse(localStorage.getItem("cart_sold")),
      cart_details: JSON.parse(localStorage.getItem("cart_details")),
    };
  }

  componentDidMount() {
    this.getPurchaseOrders();
    //localStorage.removeItem("cart");
    localStorage.removeItem("cart_sold");
    localStorage.removeItem("cart_details");
    //this.setState({ cartCheckout:null });
  }
  clearCart() {
    localStorage.removeItem("cart");
    localStorage.removeItem("cart_sold");
    localStorage.removeItem("cart_details");
    this.setState({ cartItem: null });
    this.setState({ cart_details: null });
    this.setState({ cart_sold: null });
    this.setState({ cartCheckout: null });
    this.getPurchaseOrders();
  }

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };
  getPurchaseOrders = () => {
    const { page, rows, order, search, products } = this.state;
    console.log(order);
    this.setState({ loading: true });
    getStock({ page, rows, order, search }).then(
      (res) => {
        console.log(res);
        this.setState({
          loading: false,
          stocks: res.stocks.data,
          attributes: res.attributes,
          products: res.products,
          total_cost: res.total_stock,
          suppliers: res.suppliers,
          branches: res.branches,
          total: res.stocks.total,
          initialPurchaseOrders: { ...res.stocks.data },
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };
  resetInput = (e) => {
    e.target.value = "";
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
    this.getPurchaseOrders();
  };

  onPage = async (page, rows) => {
    await this.setState({ page, rows });
    await this.getPurchaseOrders();
  };

  onFilter = async (e, filter) => {
    console.log(filter);
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

  attributeCols = (attribute_name, attribute_value) => {
    if (attribute_name !== null) {
      let attributes = new Array();
      let values = new Array();
      attributes = attribute_name.split(",");
      values = attribute_value.split(",");
      return values.map((attrs, key) => {
        return (
          <p className="mb-0 text-sm" style={{ textTransform: "capitalize" }}>
            <span style={{ fontWeight: "bold" }}>{attrs + ":" + "  "}</span>
            {attributes[key]}
          </p>
        );
      });
    } else {
      return <p style={{ fontWeight: "bold" }}>No variants</p>;
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

  formatCurrency(x) {
    if (x !== "null" && x !== "0") {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `\u20a6${parts.join(".")}`;
    }
    return "0";
  }

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
      stocks,
      value,
      order,
      products,
      attributes,
      showFilter,
      total,
      cart_sold,
      cart_details,
      total_cost,
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
        {console.log(cartCheckout)}
        {addStock && (
          <AddStock
            saved={this.getPurchaseOrders}
            resetCart={this.setState({ cartItem: null })}
            addStock={addStock}
            products={products}
            suppliers={suppliers}
            branches={branches}
            toggle={() => this.setState({ addStock: null })}
          />
        )}

        {addSales && (
          <AddSales
            saved={this.getPurchaseOrders}
            addSales={addSales}
            toggle={() => this.setState({ addSales: null })}
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
        {cartCheckout && (
          <Cart
            saved={this.getPurchaseOrders}
            cartCheckout={cartCheckout}
            toggle={() => this.setState({ cartCheckout: false })}
            //close={() => this.setState({cartItem})}
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
            <h6>Stocks({total})</h6>
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
              {/* import React, { useRef } from "react";
import { useBarcode } from "react-barcodes";


const BarCodeItem = ({barcodeValue}) => {

  const { inputRef } = useBarcode({
    value: barcodeValue,
    options: {
      displayValue: true,
      height: 50,
    },
  });

  return <svg ref={inputRef} />;
};

const BarCodeTest = (props) => {
  var data = [
    {
      barCodeValue: "123",
    },
    { barCodeValue: "456" },
  ];

// how can I set the value property as I iterate through data[]?  
return <>{data && data.map((item, index) => <BarCodeItem key={index} barcodeValue={item.barCodeValue} />)}</>;
};*/}
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
            <Col lg="10">
              <div
                style={{
                  fontSize: "18px",
                  paddingTop: "20px",
                  color: "red",
                  paddingLeft: "10px",
                  fontWeight: "bold",
                }}
              >
                Total Stock Cost:&nbsp;&#8358;
                {total_cost.map((total, key) => {
                  return total.total !== null
                    ? total.total
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "----";
                })}
              </div>
            </Col>
            <Col lg="2" style={{ color: "primary", paddingTop: "15px" }}>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  {cartItem !== null ? (
                    <div>
                      <Button
                        variant="outline-success"
                        onClick={() => this.toggleCart(cartItem)}
                        size="sm"
                      >
                        Sales({cartItem.length})
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
                        this.props.history.push("/sales_order");
                      }}
                      size="sm"
                    >
                      View Sales
                    </Button>
                  )}
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
                  <th className="border-0">Variant</th>
                  {/* <th className="border-0">Stock Order ID</th>
                  <th className="border-0">Quantity Sold</th> */}
                  <th className="border-0">Total Stock </th>
                  <th className="border-0">Total Sold </th>
                  <th className="border-0">Profit </th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock, key) => {
                  const alreadyAdded = this.inCart(stock.id);
                  return (
                    <tr key={key}>
                      <th scope="row">
                        <td>
                          <Media className="align-items-center">
                            <a
                              className="avatar rounded-circle mr-3"
                              href="#p"
                              onClick={(e) => e.preventDefault()}
                            >
                              <img
                                style={{
                                  maxHeight: 50,
                                  maxWidth: 50,
                                  borderRadius: 5,
                                }}
                                alt="..."
                                src={
                                  stock.product_image !== null
                                    ? stock.product_image.url
                                    : require("../../assets/img/brand/coke.jpeg")
                                }
                              />
                            </a>
                            <span className="mb-0 text-sm">
                              {stock.product_name}
                            </span>
                          </Media>
                        </td>
                      </th>
                      <td>
                        <span
                          className="mb-0 text-sm"
                          style={{ display: "block" }}
                        >
                          {this.attributeCols(
                            JSON.parse(stock.product_attributes),
                            JSON.parse(stock.product_attributes_keys)
                          )}
                        </span>
                        <br />

                        <span
                          className="mb-0 text-sm"
                          style={{ display: "block" }}
                        >
                          <span style={{ fontWeight: "bold" }}>
                            Selling Price:{" "}
                          </span>
                          {this.formatCurrency(stock.unit_selling_price)}
                        </span>

                        <span
                          className="mb-0 text-sm"
                          style={{ display: "block" }}
                        >
                          <span style={{ fontWeight: "bold" }}>
                            Cost Price:{" "}
                          </span>
                          {this.formatCurrency(stock.unit_price)}
                        </span>

                        <span
                          className="mb-0 text-sm"
                          style={{ display: "block" }}
                        >
                          <span style={{ fontWeight: "bold" }}>
                            Total Stock:{" "}
                          </span>
                          {stock.stock_quantity}
                        </span>
                        <span
                          className="mb-0 text-sm"
                          style={{ display: "block" }}
                        >
                          <span style={{ fontWeight: "bold" }}>Sold: </span>
                          {stock.quantity_sold}
                        </span>
                        <span
                          className="mb-0 text-sm"
                          style={{ display: "block" }}
                        >
                          <span style={{ fontWeight: "bold" }}>In Stock: </span>
                          {stock.in_stock}
                        </span>
                        <span
                          className="mb-0 text-sm"
                          style={{ display: "block" }}
                        >
                          <span style={{ fontWeight: "bold" }}>
                            Purchase ID:{" "}
                          </span>
                          {stock.tracking_id}
                        </span>
                      </td>

                      {/* <td>{stock.tracking_id}</td>
                      <td>{stock.quantity_sold}</td> */}
                      <td>
                        {this.formatCurrency(
                          stock.new_stock_qty * stock.unit_price
                        )}
                      </td>
                      <td>
                        {this.formatCurrency(
                          stock.quantity_sold * stock.unit_selling_price
                        )}
                      </td>
                      <td>{this.formatCurrency(stock.profit)}</td>
                      <td>
                        {stock.in_stock == 0 ? (
                          <Button disabled color="primary" size="sm">
                            Out of Stock
                          </Button>
                        ) : alreadyAdded === false ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            //  onClick={() => this.toggleAddToCart(stock)}
                            //onClick={() => this.toggleAddSales(stock)}
                          >
                            In Stock
                          </Button>
                        ) : (
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => this.toggleCart(cartItem)}
                            //onClick={() => this.toggleAddSales(stock)}
                          >
                            View Sales made
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
                {stocks.length < 1 && (
                  <div
                    style={{
                      color: "#ccc",
                      alignSelf: "center",
                      padding: 10,
                      fontSize: 13,
                    }}
                  >
                    <i className="fa fa-ban" style={{ marginRight: 5 }} />
                    No Stocks for the date Range
                  </div>
                )}
                {stocks.length > 0 && (
                  <Pagination
                    total={total}
                    showTotal={(total) => `Total ${total} Stocks`}
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

export default StockIndex2;
