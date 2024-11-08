import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "reactstrap";
import {
  getAllPurchaseOrders,
  addPurchaseorder,
  getPurchaseOrders,
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

import * as XLSX from "xlsx";
import SpinDiv from "../components/SpinDiv";

import AddOrder from "./AddOrder";
import EditOrder from "./EditOrder";
import moment from "moment";
import "antd/dist/antd.css";
import { Pagination } from "antd";
import { formatCurrency, format } from "../../services/formatCurrencyService";
import ReactDatetime from "react-datetime";
import AddSupplier from "../suppliers/AddSupplier";

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
      options: [],
      total_purchase: 0,
      fromdate: moment().startOf("month"),
      todate: moment().endOf("day"),
    };
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
          // products: res.products,
          // p: res.products.map((opt) => ({ label: opt.name, value: opt.id })),
          suppliers: res.suppliers,
          branches: res.branches,
          total: res.purchase_orders.total,
          total_purchase: res.total_purchase,
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

  onPage = async (page, rows) => {
    await this.setState({ page, rows });
    await this.getPurchaseOrders();
  };

  formatCurrency(x) {
    if (x !== null && x !== 0) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `\u20a6${parts.join(".")}`;
    }
    return 0;
  }

  totalPurchase() {
    const { total_purchase } = this.state;

    return this.formatCurrency(total_purchase);
  }

  onFilter = async (e, filter) => {
    if (filter === "order") {
      await this.setState({ branch: "" });
    }
    await this.setState({ [filter]: e });
    await this.getPurchaseOrders();
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

  toggleAddSupplier = () => {
    this.setState({ addSupplier: !this.state.addSupplier });
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

  export = async () => {
    const { page, search, total, order, fromdate, todate } = this.state;
    const rows = 1000;
    if (total < 1) {
      await setTimeout(
        () => this.showToast("No income history to export."),
        250
      );
    } else {
      this.setState({ loading: true });

      getAllPurchaseOrders({
        page,
        rows,
        search,
        order,
        fromdate,
        todate,
      }).then(
        (response) => {
          let exportt = "";
          exportt = response.purchase_orders.data.map((c) => ({
            product_name: c.product_name,
            supplier: c.supplier.name,
            order_id: c.tracking_id,
            purchased_unit: c.stock_quantity,
            instock: c.in_stock,
            unitprice: c.unit_price,
            cost: this.formatC(c.unit_price),
            status: c.status,
            issuedDate: moment(c.created_at).format("MMM DD YYYY"),
            dueDate: moment(c.due_date).format("MMM DD YYYY"),
          }));

          const theheader = [
            "product_name",
            "supplier",
            "order_id",
            "purchased_unit",
            "instock",
            "cost",
            "status",
            "issuedDate",
            "dueDate",
          ];
          const wch = [30, 20, 15, 20, 40, 20, 20, 20, 20];
          const cols = wch.map((h) => {
            return { wch: h };
          });
          const thedata = exportt.map((item) => {
            return theheader.map((item2) => {
              return item[item2];
            });
          });

          const headerTitle = "your header title here";

          const allofit = [theheader].concat(thedata);

          const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(allofit);

          const wb: XLSX.WorkBook = XLSX.utils.book_new(headerTitle);
          ws["!cols"] = cols;
          XLSX.utils.book_append_sheet(wb, ws, `PurchaseOrder`);
          XLSX.writeFile(
            wb,
            `purchase-order-history-${fromdate}-${todate}-.xlsx`
          );
          this.setState({
            loading: false,
          });
        },
        (error) => {
          this.setState({ loading: false });
        }
      );
    }
  };

  render() {
    const {
      purchase_orders,
      value,
      addSupplier,
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
          <AddOrder
            saved={this.getPurchaseOrders}
            addStock={addStock}
            products={products}
            suppliers={suppliers}
            branches={branches}
            toggle={() => this.setState({ addStock: null })}
          />
        )}

        {addSupplier && (
          <AddSupplier
            saved={this.getPurchaseOrders}
            addSupplier={addSupplier}
            toggle={() => this.setState({ addSupplier: null })}
          />
        )}

        {editStock && (
          <EditOrder
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
                    onClick={this.export}
                  >
                    Export Purchase Order
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => this.toggleAddSupplier()}
                  >
                    Create Suppliers
                  </Button>
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
                  // isValidDate={(current)=>{return (current.isAfter(fromdate)||current.isSame(fromdate))&&current.isBefore(moment());}}
                  timeFormat={false}
                />
              </Col>
            </Row>
          </Col>
          {/* <Col lg="1">
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
          </Col> */}
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
          {/* {showFilter && (
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
          )} */}
        </Row>

        <Card border="light" className="shadow-sm mb-4">
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
                Total Purchase Order Cost:{this.totalPurchase()}
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
                  <th className="border-0">Available</th>
                  <th className="border-0">Unit Price</th>
                  <th className="border-0">Total cost</th>
                  <th className="border-0">Date</th>
                  <th className="border-0">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchase_orders.map((purchase_order, key) => {
                  return (
                    <tr key={key} style={{ fontWeight: "bold" }}>
                      <td>{purchase_order.product_name}</td>
                      <td>
                        {purchase_order.supplier !== null
                          ? purchase_order.supplier.name
                          : ""}
                      </td>
                      <td>{purchase_order.tracking_id}</td>
                      <td>
                        {this.formatNumber(purchase_order.stock_quantity)}
                      </td>
                      <td>{this.formatNumber(purchase_order.in_stock)}</td>
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
                      <td style={{ textTransform: "capitalize" }}>
                        {purchase_order.status}
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
                            Confirm Order
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
                    No Purchase Order for the date Range
                  </div>
                )}
                {purchase_orders.length > 0 && (
                  <Pagination
                    showSizeChanger
                    defaultCurrent={6}
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
