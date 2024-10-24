import React, { Component } from "react";
import ReactToPrint from "react-to-print";
import { Media, Modal } from "reactstrap";
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
import { addSales } from "../../services/posOrderService";
import { toast } from "react-toastify";
import { Invoice } from "../stock/Invoice";

export class Cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      saving: false,
      users: [],
      total: 0,
      total_cart: 0,
      items:[],
      cartCheckout:[],
      quantity_sold: [],
      payment_mode: "",
      tracking_id: [],
      cart_sold: [],
      cart_details: [],
      q: [],
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount(){
    const {cartCheckout}=this.props;
    this.setState({items:cartCheckout})
  }

  onChange = (e, state) => {
    console.log(e.target.value);
    this.setState({ payment_mode: e.target.value });
  };

  onChange2 = (e, state) => {
    const { sale } = this.state;

    this.setState({ sale: { ...sale, [state]: e } });
    console.log(sale);
  };

  handleChange = (item, e, index) => {
    const items = this.state.cartCheckout;
    const cart_qty = e.target.value;
    console.log(cart_qty);
    item.quantity = cart_qty;
    items.splice(index, 1, item);
    this.setState({
      cartCheckout: items,
    });
  };

  incrementCount(item, index) {
    // index will be the key value
    const items = this.state.cartCheckout;
    let inStock = item.stock_quantity - item.quantity_sold;
    if (item.quantity < inStock) {
      item.quantity += 1;
    }
    items.splice(index, 1, item);
    this.setState({
      cartCheckout: items,
    });
    //console.log(this.state.cartCheckout)
  }

  decrementCount(item, index) {
    // index will be the key value
    const items = this.state.cartCheckout;
    if (item.quantity > 1) {
      item.quantity -= 1;
    }
    items.splice(index, 1, item);
    this.setState({
      cartCheckout: items,
    });
    console.log(this.state.cartCheckout);
  }

  showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "red" }}>*{msg}</div>);
  };

  onSaveSales = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { cartCheckout, payment_mode, validation } = this.state;
    //console.log(cartCheckout);

    await this.setState({
      validation: {
        ...validation,
        payment_mode: payment_mode !== "",
      },
    });

    const check_qty_field = cartCheckout.filter(p => p.quantity == null);
    console.log(check_qty_field.length)
    toast.dismiss();
    toast.configure({ hideProgressBar: true, closeButton: false });
    if(check_qty_field.length !== 0){
     this.showToastError("Please Add Quantity")
    } else if ( payment_mode == "") {
      this.showToastError("Please Add Payment Mode")
      
    } else {
      this.saveSales();
    }
  };

  validationRules = (field) => {
    if (field === "payment_mode") {
      return "Mode of payment is required";
    } else if (field === "quantity_sold") {
      return "Please add qty";
    }
  };

  removeFromCart(index) {
    const list = this.state.cartCheckout;

    list.splice(index, 1);
    this.setState({ cartCheckout: list });
  }

  saveSales = () => {
    this.setState({ loading: true, saving: true });
    //localStorage.setItem('qty_sold').

    const { cartCheckout, payment_mode, saving, attributes } = this.state;
    console.log(payment_mode);
    cartCheckout.map((cart, key) => {});
    addSales({
      values: cartCheckout,
      payment_mode: payment_mode,
      tracking_id: cartCheckout.tracking_id,
    }).then(
      (res) => {
        console.log(res);
        this.setState({ loading: false, saving: false });
        let cart_details = [];
        cart_details = this.state.cartCheckout;
        this.setState({ cart_details: cart_details });
        this.setState({ cartCheckout: [] });
        //this.props.saved();
        //this.props.toggle();
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
    for (let i = 1; i <= quantity; i++) {
      text.push(
        <option value={i} key={i}>
          {i}
        </option>
      );
    }
    return text;
  };

  inCart = (cartId) => {
    let inCartIds = this.state.cartCheckout;

    if (inCartIds !== null) {
      var result = inCartIds.map((user, key) => {
        return user.id;
      });
      let validateId = result.includes(cartId);

      return validateId;
    } else {
      return false;
    }
  };

  totalCart() {
    if (this.state.cartCheckout !== null) {
      let total_cart = this.state.cartCheckout.reduce(function (sum, item) {
        return (sum = sum + item.quantity);
      }, 0);
      return total_cart;
    } else {
      return 0;
    }
  }

  totalCartP() {
    const { cartCheckout } = this.state;
    let sum = 0;

    for (let i = 0; i < cartCheckout.length; i += 1) {
      sum += cartCheckout[i].quantity * cartCheckout[i].unit_selling_price;
    }
    return this.formatCurrency(sum);
  }

  formatCurrency(x) {
    if (x !== "null" && x !== "0") {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `\u20a6${parts.join(".")}`;
    }
    return "0";
  }

  totalPurchase() {
    //console.log(this.state.cart_sold);
  }

  render() {
    const {cartCheckout}= this.props;
    const {
      //cartCheckout,
      cart_details,
      items,
      cart_sold,
      quantity_sold,
      tracking_id,
      loading,
      saving,
      sale,
    } = this.state;
    console.log(items)
    return (
      <>
        {cart_details && (
          <div style={{ display: "none" }}>
            <Invoice
              saved={this.getPurchaseOrders}
              cart_details={cart_details}
              ref={(el) => (this.componentRef = el)}
              toggle={() => this.setState({ cart_details: [] })}
            />
          </div>
        )}
        {/* <Modal
          className="modal-dialog-full"
          isOpen={cartCheckout != null}
          toggle={() => !loading && toggle}
          style={{ maxWidth: "70%", marginRight: "100px" }}
        > */}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <ButtonGroup>
                {cartCheckout.length > 0 ? (
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
                {cart_details.length > 0 ? (
                  <ReactToPrint
                    trigger={() => {
                      return (
                        <Button variant="outline-success" href="#" size="sm">
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

            {/* <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={this.props.toggle}
            ></button> */}
          </div>
          <Card border="light" className="shadow-sm mb-4">
            <Card.Body className="pb-0">
              {cart_details.length == 0 ? (
                <div>
                  <Table
                    responsive
                    className="table-centered table-nowrap rounded mb-0"
                  >
                    <thead className="thead-light">
                      <tr>
                        <th className="border-0">Product</th>
                        <th className="border-0">Price</th>
                        <th className="border-0">Stock ID</th>
                        <th className="border-0">Instock</th>

                        {/* <th className="border-0">Branch</th> */}
                        <th className="border-0">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartCheckout.map((sale, key) => {
                        const alreadyAdded = this.inCart(sale.id);
                        return (
                          <tr>
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
                                      sale.p ||
                                      require("../../assets/img/brand/coke.jpeg")
                                    }
                                  />
                                </a>
                                <span className="mb-0 text-sm">
                                  {sale.product_name}
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
                            <td>{sale.unit_selling_price}</td>
                            <td>{sale.tracking_id}</td>
                            <td>{sale.stock_quantity - sale.quantity_sold}</td>
                            {/* <td>{sale.branch_name}</td> */}
                            {
                              <td>
                                <Form.Group className="mb-2">
                                  <Form.Select
                                    required
                                    onChange={(e) =>
                                      this.handleChange(sale, e, key)
                                    }
                                    style={{
                                      marginRight: 10,
                                      width: "60%",
                                    }}
                                  >
                                    <option value="">Select Qty</option>
                                    {this.selectQuantity(sale.in_stock)}
                                  </Form.Select>
                                </Form.Group>
                              </td>
                            }
                            <td>
                              {/* <div>
                              <Button size="sm"variant="outline-primary" 
                              onClick={() => this.decrementCount(sale,key)}>-</Button>
                              <span style={{padding:"10px"}}>{sale.quantity}</span>
                              <Button size="sm" variant="outline-primary" onClick={() => 
                                this.incrementCount(sale,key)}>+</Button>
                            </div>*/}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  <Table style={{ border: "none" }}>
                    <tr className="border-0">
                      <td>
                        <Form.Group style={{ borderBottom: "none" }}>
                          <td>
                            <Form.Label>Mode of payment</Form.Label>
                          </td>
                          <td>
                            <Form.Select
                              required
                              name="payment_mode"
                              onChange={this.onChange}
                              style={{
                                marginRight: 10,
                                width: "100%",
                              }}
                            >
                              <option value="">Select payment mode</option>
                              <option value="cash">Cash</option>
                              <option value="card">Card</option>
                              <option value="transfer">Transfer</option>
                            </Form.Select>
                          </td>
                        </Form.Group>
                      </td>
                    </tr>
                  </Table>
                  <Table
                    responsive
                    className="table-centered table-nowrap rounded mb-0"
                  >
                    <tr className="border-0" style={{ border: "none" }}>
                      <td colSpan={2}>
                      <div className="mt-3">
                        {cartCheckout.length > 0 ? (
                          <div>
                            <Button
                              variant="primary"
                              type="submit"
                              disabled={saving}
                              onClick={this.onSaveSales}
                            >
                              Approve Sale
                            </Button>
                            {/* <Button
                              size="sm"
                              style={{ marginLeft: 10 }}
                              variant="outline-primary"
                              data-dismiss="modal"
                              type="button"
                              onClick={toggle}
                            >
                              Close
                            </Button> */}
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
                      Sales has been completed, Print Invoice by <br />
                      clicking on the Button above
                    </h5>
                  </Col>
                  <Col md={2}></Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        {/* </Modal> */}
      </>
    );
  }
}

export default Cart;
