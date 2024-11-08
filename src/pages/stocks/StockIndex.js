import React, { Component } from "react";
import { Input, Media } from "reactstrap";
import { getStock } from "../../services/stockService";
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

import { Pagination } from "antd";

export class StockIndex extends Component {
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
      branch_id: props.match.params.id,
    };
  }

  componentDidMount() {
    this.getStocks();
  }

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };
  getStocks = () => {
    const { page, rows, order, search, branch_id, products } = this.state;
    console.log(order);
    this.setState({ loading: true });
    getStock({ page, rows, order, branch_id, search }).then(
      (res) => {
        console.log(res);
        this.setState({
          loading: false,
          stocks: res.stocks.data,
          products: res.products.data,
          total_cost: 0,
          suppliers: res.suppliers.data,
          total: res.stocks.total,
          initialPurchaseOrders: { ...res.stocks.data },
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
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

  onPage = async (page, rows) => {
    await this.setState({ page, rows });
    await this.getStocks();
  };

  onFilter = async (e, filter) => {
    console.log(filter);
    await this.setState({ [filter]: e });
    await this.getStocks();
  };

  onChange = (e, state) => {
    this.setState({ [state]: e });
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
        {loading && <SpinDiv text={"Loading..."} />}
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
                  <Breadcrumb.Item href="#stocks">Stocks</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                {/* <ButtonGroup>

                  <Button variant="outline-primary" size="sm"
                    onClick={() => { this.props.history.push('/products') }}

                  >
                    Products
                  </Button>



                </ButtonGroup> */}
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
                    this.getStocks();
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
                onClick={this.getStocks}
              >
                <i className="fa fa-search" />
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            {showFilter && (
              <Row>
                <Col md={4}>
                  <Form.Select
                    value={order}
                    type="select"
                    onChange={(e) => this.onFilter(e.target.value, "order")}
                  >
                    <option value="">Select Product</option>
                    {products.map((p, index) => (
                      <option value={p.id} key={p}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Button
                    color="warning"
                    onClick={this.toggleFilter}
                    size="sm"
                    style={{ marginRight: 10 }}
                  >
                    Hide Filters
                  </Button>
                </Col>
              </Row>
            )}
          </Col>
        </Row>

        <Card border="light" className="shadow-sm mb-4">
          <Row>
            {/* <Col lg="10">
              <div style={{
                fontSize: "18px", paddingTop: "20px", color: "red",
                paddingLeft: "10px", fontWeight: "bold"
              }}>
                Total Stock Cost:&nbsp;&#8358;
                {total_cost.map((total, key) => {
                  return (total.total !== null ? total.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "----");
                })}
              </div>
            </Col> */}
            <Col lg="2" style={{ color: "primary", paddingTop: "15px" }}></Col>
          </Row>
          <Card.Body className="pb-0">
            <Table
              responsive
              className="table-centered table-nowrap rounded mb-0"
            >
              <thead className="thead-light">
                <tr>
                  <th className="border-0">Product</th>
                  <th className="border-0">Branch</th>
                  <th className="border-0">Variant</th>
                  {/* <th className="border-0">Stock Order ID</th>
                  <th className="border-0">Quantity Sold</th> */}
                  <th className="border-0">Supplier </th>
                  <th className="border-0">Sold</th>
                  <th className="border-0">Amount</th>
                  <th className="border-0">Action</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock, key) => {
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
                              {stock.product_image !== null && (
                                <img
                                  style={{
                                    maxHeight: 50,
                                    maxWidth: 50,
                                    borderRadius: 5,
                                  }}
                                  alt="..."
                                  src={stock.product_image}
                                />
                              )}
                            </a>
                            <span className="mb-0 text-sm">
                              {stock.product_name}
                            </span>
                          </Media>
                        </td>
                      </th>
                      <td>{stock.branch_name}</td>
                      <td>
                        <span
                          className="mb-0 text-sm"
                          style={{ display: "block" }}
                        >
                          {this.attributeCols(
                            JSON.parse(stock.order.product_attributes),
                            JSON.parse(stock.order.product_attributes_keys)
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
                          {this.formatCurrency(stock.order.unit_selling_price)}
                        </span>

                        <span
                          className="mb-0 text-sm"
                          style={{ display: "block" }}
                        >
                          <span style={{ fontWeight: "bold" }}>
                            Cost Price:{" "}
                          </span>
                          {this.formatCurrency(stock.order.unit_price)}
                        </span>

                        <span
                          className="mb-0 text-sm"
                          style={{ display: "block" }}
                        >
                          <span style={{ fontWeight: "bold" }}>
                            Initial Stock:{" "}
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
                          {stock.order.tracking_id}
                        </span>
                      </td>
                      <td>{stock.order.supplier_name}</td>
                      <td>{stock.quantity_sold}</td>

                      <td>
                        {this.formatCurrency(
                          stock.quantity_sold * stock.order.unit_selling_price
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            //console.log('111')
                            this.props.history.push(
                              "/stock/" +
                                stock.id +
                                "/product/" +
                                stock.order.product_id
                            );
                          }}
                        >
                          View
                        </Button>
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

export default StockIndex;
