import React, { Component } from "react";

import { Col, Row, Card, Form } from "@themesberg/react-bootstrap";

import { Button, InputNumber, Spin, Select } from "antd";

import SpinDiv from "../components/SpinDiv";
import axios from "axios";
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";
import { toast } from "react-toastify";
import { Modal } from "reactstrap";
import moment from "moment";
import { getProducts } from "../../services/productService";

const { Option } = Select;

export class AddOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      selectedTitle: "",
      inputValue: "",
      product_id: "",
      rows: 10,
      loading: false,
      tags: [],
      attributes: [],
      validation: {},
      products: [],
      suppliers: [],
      supplier: 1,
      // suppliers: props.suppliers.map((opt) => ({
      //   label: opt.name,
      //   value: opt.id,
      // })),
      fromdate: moment().startOf("month"),
    };
  }

  componentDidMount() {
    this.getProducts();
  }

  // getSuppliers = (page, search) => {
  //   const { rows } = this.state;
  //   getSuppliers({ rows, page, search }).then(
  //     (res) => {
  //       this.setState({
  //         suppliers: res.suppliers.data.map((opt) => ({
  //           label: opt.name,
  //           value: opt.id,
  //         })),
  //       });
  //     },
  //     (error) => {
  //       this.setState({ loading: false });
  //     }
  //   );
  // };

  getProducts = () => {
    const { page, rows, search, products } = this.state;
    this.setState({ loading: true });
    getProducts({ page, rows, search }).then(
      (res) => {
        this.setState({
          products: [...products, ...res.products.data],
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
        () => this.getProducts()
      );
    }
  };

  // Handle search input
  handleSearch = (value) => {
    this.setState({ search: value, page: 1, products: [], hasMore: true }, () =>
      this.getProducts()
    );
  };

  validationRules = (field) => {
    if (field === "stock_quantity") {
      return "stock quantity is required";
    } else if (field === "unit_price") {
      return "Unit price is required";
    } else if (field === "supplier") {
      return "supplier is required";
    } else if (field === "product") {
      return "product is required";
    }
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };

  onSaveStock = async (e) => {
    e.preventDefault();

    await toast.dismiss();
    const { stock_quantity, unit_price, supplier, validation, product_id } =
      this.state;
    console.log(product_id);
    await this.setState({
      validation: {
        ...validation,
        stock_quantity: stock_quantity !== "" && stock_quantity !== undefined,
        unit_price: unit_price !== "" && unit_price !== undefined,
        product: product_id !== "",
        // supplier: supplier !== "" && supplier !== undefined,
      },
    });
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveStock();
    } else {
      const errors = Object.keys(this.state.validation).filter((id) => {
        return !this.state.validation[id];
      });
      toast.dismiss();
      toast.configure({ hideProgressBar: true, closeButton: false });
      toast(
        <div style={{ padding: "10px 20px" }}>
          <p style={{ margin: 0, fontWeight: "bold", color: "red" }}>Errors:</p>
          {errors.map((v) => (
            <p key={v} style={{ margin: 0, fontSize: 14, color: "red" }}>
              * {this.validationRules(v)}
            </p>
          ))}
        </div>
      );
    }
  };

  saveStock = () => {
    this.setState({ saving: true });

    const { unit_price, stock_quantity, supplier, product_id } = this.state;

    let data = new FormData();

    data.set("unit_price", unit_price);
    data.set("product_id", product_id);
    data.set("stock_quantity", stock_quantity);
    data.set("supplier", supplier);
    return axios
      .post(
        `${settings.API_URL}purchase_order`,
        data,
        {
          headers: authHeader(),
        },
        authService.handleResponse
      )
      .then((res) => {
        console.log(res.data);
        this.setState({ saving: false, edit: false });
        this.props.saved();
        this.props.toggle();

        this.showToast("Purchase order created");
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          errorMessage: err.response.data,
          show: true,
        });
        if (this.state.errorMessage) {
          this.showToast("Server error");
        }
        this.setState({ saving: false });
      });
  };

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  onChange2 = (value) => {
    this.setState({ product_id: value });
  };

  render() {
    const { addStock, toggle } = this.props;
    const { loading, products, addSupplier, saving } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={addStock != null}
          toggle={() => !loading && !saving && toggle}
          style={{ maxWidth: 700 }}
        >
          {loading && <SpinDiv text={"Loading..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <h5>Create Order</h5>
            </div>

            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={toggle}
            ></button>
          </div>
          <Card border="light" className="shadow-sm mb-4">
            <Card.Body className="pb-0">
              <Row>
                <Col md={12} className="mb-3">
                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-2">
                        <Form.Label>Select Product</Form.Label>
                        <Select
                          showSearch
                          placeholder="Search products"
                          filterOption={false}
                          onSearch={this.handleSearch}
                          onPopupScroll={this.handlePopupScroll}
                          onChange={this.onChange2}
                          notFoundContent={
                            loading ? <Spin size="small" /> : null
                          }
                          style={{ width: "100%" }}
                        >
                          {products.map((product) => (
                            <Option key={product.id} value={product.id}>
                              {product.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group id="lastName">
                    <Form.Label>Purchase Order Unit</Form.Label>
                    <InputNumber
                      style={{
                        width: "100%",
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
                      placeholder="Enter Purchase Order Unit"
                      onChange={(e) => this.onChange(e, "stock_quantity")}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group id="lastName">
                    <Form.Label>Unit Price</Form.Label>
                    <div>
                      <InputNumber
                        style={{
                          width: "100%",
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
                        placeholder="Enter Unit Cost"
                        onChange={(e) => this.onChange(e, "unit_price")}
                      />
                    </div>
                  </Form.Group>
                </Col>
                {/* <Col md={6} className="mb-3">
                  <Form.Group className="mb-2">
                    <Form.Label>Select Supplier</Form.Label>
                    <AsyncPaginate
                      onChange={this.handleSupplierChange}
                      loadOptions={this.loadSuppliers(suppliers)}
                      additional={{
                        page: 1,
                      }}
                    />
                    
                  </Form.Group>
                </Col> */}

                <div className="mt-3" style={{ marginBottom: 15 }}>
                  <div>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={saving}
                      onClick={this.onSaveStock}
                    >
                      {saving ? (
                        <Spin tip="Saving..." />
                      ) : (
                        <span> Save Purchase order</span>
                      )}
                    </Button>
                  </div>
                </div>
              </Row>
            </Card.Body>
          </Card>
        </Modal>
      </>
    );
  }
}

export default AddOrder;
