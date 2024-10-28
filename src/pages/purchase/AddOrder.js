import React, { Component } from "react";

import {
  Col,
  Row,
  Nav,
  Card,
  Table,
  Form,
  ButtonGroup,
  Breadcrumb,
  InputGroup,
  Dropdown,
} from "@themesberg/react-bootstrap";
import {
  faEnvelope,
  faPhone,
  faLock,
  faPencilAlt,
  faAddressCard,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import { Button, InputNumber, Spin } from "antd";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { AsyncPaginate } from "react-select-async-paginate";

import Profile3 from "../../assets/img/team/profile-picture-3.jpg";
import SpinDiv from "../components/SpinDiv";
import axios from "axios";
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";
import { toast } from "react-toastify";
import { filterAttributes } from "../../services/purchaseOrderService";
import { CardHeader, Media, Input, Modal } from "reactstrap";
import AttributeOptions from "../products/AttributeOptions";
import AddAttribute from "../products/AddAttribute";
import CurrencyInput from "react-currency-input-field";
import { formatCurrency } from "../../services/formatCurrencyService";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AddSupplier from "../suppliers/AddSupplier";
import { getSuppliers } from "../../services/supplierService";
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
      products: props.products.map((opt) => ({
        label: opt.name,
        value: opt.id,
      })),
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
    this.getSuppliers();
  }

  getSuppliers = (page, search) => {
    const { rows } = this.state;
    getSuppliers({ rows, page, search }).then(
      (res) => {
        this.setState({
          suppliers: res.suppliers.data.map((opt) => ({
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

  toggleEdit = () => {
    const { initialProduct } = this.state;
    this.setState({ edit: !this.state.edit, stock: { ...initialProduct } });
  };

  toggleAttributeValue = (addAttributeValue) => {
    this.setState({ addAttributeValue });
  };

  toggleAddAttribute = () => {
    this.setState({ addAttributes: !this.state.addAttributes });
  };

  toggleAddSupplier = () => {
    this.setState({ addSupplier: !this.state.addSupplier });
  };

  validationRules = (field) => {
    if (field === "stock_quantity") {
      return "stock quantity is required";
    } else if (field === "unit_price") {
      return "Unit price is required";
    } else if (field === "supplier") {
      return "supplier is required";
    }
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };

  filter = async () => {
    this.setState({ filtering: true });
    const { product_id } = this.state;
    filterAttributes({ product_id }).then(
      (res) => {
        this.setState({
          filtering: false,
          attributes: res.attributes,
        });
      },
      (error) => {
        console.log(error);
        this.setState({ filtering: false });
      }
    );
  };

  onSaveStock = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const {
      stock_quantity,
      unit_price,
      supplier,
      validation,
      product_attributes_values,
    } = this.state;
    await this.setState({
      validation: {
        ...validation,
        //product_attributes_values:product_attributes_values !== undefined && product_attributes_values.length !== 0,
        stock_quantity: stock_quantity !== "" && stock_quantity !== undefined,
        unit_price: unit_price !== "" && unit_price !== undefined,
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

    const {
      product_attributes_values,
      unit_price,
      stock_quantity,
      supplier,
      product,
      product_id,
    } = this.state;

    let attribute_values = "";
    let attribute_keys = "";
    let data = new FormData();
    if (product_attributes_values !== undefined) {
      for (let x in product_attributes_values) {
        attribute_values += product_attributes_values[x] + ",";
        let attribute_values_1 = attribute_values.slice(0, -1);
        data.set("product_attributes", JSON.stringify(attribute_values_1));
      }
      let product_attribute_keys = Object.keys(product_attributes_values);
      for (let x in product_attribute_keys) {
        attribute_keys += product_attribute_keys[x] + ",";
        let attribute_keys_1 = attribute_keys.slice(0, -1);
        data.set("product_attributes_keys", JSON.stringify(attribute_keys_1));
      }
    }
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

  filterProduct = (inputValue) => {
    return this.state.products.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  // filterSupplier = (inputValue) => {
  //   return this.state.suppliers.filter((i) =>
  //     i.label.toLowerCase().includes(inputValue.toLowerCase())
  //   );
  // };

  // loadSuppliers = (inputValue, callback) => {
  //   setTimeout(() => {
  //     callback(this.filterSupplier(inputValue));
  //   }, 1000);
  // };

  handleSupplierChange = async (supplier) => {
    await this.setState({ supplier: supplier.value });
  };

  loadSuppliers =
    (data) =>
    async (search, loadedOptions, { page }) => {
      await this.getSuppliers(page, search);
      console.log(data);
      //const new_data = {data}

      return {
        options: data,
        hasMore: data.length >= 10,
        additional: {
          page: search ? 2 : page + 1,
        },
      };
    };

  loadOptions = (inputValue, callback) => {
    setTimeout(() => {
      callback(this.filterProduct(inputValue));
    }, 1000);
  };

  onChange2 = (e, state) => {
    this.setState({ [state]: e });
  };

  handleChange = (event) => {
    const { value, name } = event.target;
    const { product_attributes_values } = this.state;
    this.setState({
      product_attributes_values: {
        ...product_attributes_values,
        [name]: value,
      },
    });
  };
  handleInputChange = (newValue) => {
    const inputValue = newValue.replace(/\W/g, "");
    this.setState({ inputValue });
    return inputValue;
  };

  render() {
    const { addStock, products, toggle } = this.props;
    const {
      loading,
      suppliers,
      edit,
      fromdate,
      product_id,
      addAttributes,
      addSupplier,
      stock,
      saving,
      addAttributeValue,
      attributes,
      validation,
      filtering,
    } = this.state;
    return (
      <>
        {addAttributeValue && (
          <AttributeOptions
            saved={this.filter}
            addAttributeValue={addAttributeValue}
            toggle={() => this.setState({ addAttributeValue: null })}
          />
        )}

        {addAttributes && (
          <AddAttribute
            saved={this.filter}
            product_id={product_id}
            addAttributes={addAttributes}
            toggle={() => this.setState({ addAttributes: null })}
          />
        )}

        {addSupplier && (
          <AddSupplier
            saved={this.getSuppliers}
            addSupplier={addSupplier}
            toggle={() => this.setState({ addSupplier: null })}
          />
        )}

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
                        <AsyncSelect
                          cacheOptions
                          defaultOptions
                          disabled={filtering}
                          loadOptions={this.loadOptions}
                          onInputChange={this.handleInputChange}
                          onChange={async (property, value) => {
                            console.log(property);
                            await this.setState({
                              product_id: property.value,
                              selectedTitle: property.label,
                            });
                            await this.filter();
                          }}
                        />
                      </Form.Group>
                    </Col>
                    {/* <Col md={4} style={{ paddingTop: 30 }}>
                      <ButtonGroup>
                        {product_id !== "" ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => this.toggleAddAttribute()}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                            &nbsp;Create Product Varieties
                          </Button>
                        ) : (
                          ""
                        )}
                      </ButtonGroup>
                    </Col> */}
                  </Row>
                  <Row>
                    <Col md={12}>
                      <Row>
                        {console.log(attributes)}
                        {attributes.length > 0 && (
                          <Form.Label>Variants</Form.Label>
                        )}
                        {filtering
                          ? "loading..."
                          : attributes.map((attribute, key) => {
                              return (
                                <Row>
                                  <Col md={7} className="mb-3">
                                    <Form.Group className="mb-2">
                                      Select {attribute.name}
                                      <Form.Select
                                        id="state"
                                        required
                                        name={`${attribute.name}`}
                                        onChange={this.handleChange}
                                        style={{
                                          marginRight: 10,
                                          width: "100%",
                                          color:
                                            validation.product_attributes_values ===
                                            false
                                              ? "red"
                                              : null,
                                        }}
                                      >
                                        <option value="">
                                          choose {attribute.name}{" "}
                                        </option>
                                        {attribute.attributevalues.map(
                                          (p, index) => (
                                            <option
                                              value={p.attribute_value}
                                              key={p}
                                            >
                                              {p.attribute_value}
                                            </option>
                                          )
                                        )}
                                      </Form.Select>
                                    </Form.Group>
                                  </Col>
                                  <Col md={5}>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      style={{ marginTop: "30px" }}
                                      onClick={() =>
                                        this.toggleAttributeValue(attribute)
                                      }
                                    >
                                      Add Variant Options
                                    </Button>
                                  </Col>
                                </Row>
                              );
                            })}
                      </Row>
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
