import React, { Component } from "react";

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
import AsyncSelect from "react-select/async";
import Select from "react-select";

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
import CurrencyInput from 'react-currency-input-field';
import {formatCurrency} from "../../services/formatCurrencyService";
import moment from "moment";
export class AddStock extends Component {
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
      suppliers:props.suppliers.map((opt) => ({
        label: opt.name,
        value: opt.id,
      })),
      fromdate: moment().startOf('month'),
    };
  }
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


  validationRules = (field) => {
    if (field === "stock_quantity") {
      return "stock quantity is required";
    } else if (field === "unit_price") {
      return "Unit price is required";
    } else if (field === "supplier") {
      return "supplier is required";
    }
  };
  formatC=(x)=>{
    return formatCurrency(x)
  }

  searchTitles = async (movieTitle) => {
    console.log(this.state.products);
    const compare = this.state.products.map((film) => ({
      label: film.name,
      value: film.id,
    }));

    return compare;
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

  stripComma=(a)=>{
    a=a.replace(/\,/g,'');
    a=parseInt(a,10);
    return a;
  }

  onSaveStock = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const {stock_quantity, unit_price, supplier,validation, product_attributes_values } = this.state;
    await this.setState({
      validation: {
        ...validation,
        //product_attributes_values:product_attributes_values !== undefined && product_attributes_values.length !== 0,
        stock_quantity:stock_quantity !== '' && stock_quantity !== undefined,
        unit_price:unit_price !== ''&& unit_price !== undefined,
        supplier: supplier !== '' && supplier !== undefined,
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

    const { product_attributes_values, unit_price,stock_quantity,supplier, product, product_id } =
      this.state;

    let attribute_values = "";
    let attribute_keys = "";
    let data = new FormData();
    if(product_attributes_values !== undefined){
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
    data.set("unit_price", this.stripComma(unit_price));
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

  filterSupplier = (inputValue) => {
    return this.state.suppliers.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  

  loadOptions = (inputValue, callback) => {
    setTimeout(() => {
      callback(this.filterProduct(inputValue));
    }, 1000);
  };

  loadSuppliers = (inputValue, callback) => {
    setTimeout(() => {
      callback(this.filterSupplier(inputValue));
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
    const { loading, suppliers,edit,fromdate, product_id,addAttributes,stock, saving,addAttributeValue, attributes, validation, filtering } =this.state;
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

        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={addStock != null}
          toggle={() => !loading && !saving && toggle}
          style={{ maxWidth: 700 }}
        >
          {loading && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <ButtonGroup>
                
                {console.log(product_id)}
                {product_id !== "" ? <Button
                variant="outline-primary"
                size="sm"
                onClick={() => this.toggleAddAttribute()}
              >
                Add Attribute
              </Button> : ""}
              

              </ButtonGroup>
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
                {saving && <SpinDiv text={"Saving..."} />}
                <Col md={12} className="mb-3">
                  <Row>
                    <Col md={9}>
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
                  </Row>
                  <Row>
                    <Col md={12}>
                      <Row>
                        <Form.Label>Attributes</Form.Label>
                        {filtering
                          ? "loading..."
                          : attributes.map((attribute, key) => {
                              return (
                                <Row>
                                  <Col md={7} className="mb-3">
                                    <Form.Group className="mb-2">
                                      <Form.Label>
                                        Select {attribute.name}
                                      </Form.Label>

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
                                  Add attribute values
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
                    <Form.Label>Purchase order Unit</Form.Label>

                    <Form.Control
                      type="number"
                      placeholder="Stock Quantity"
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "stock_quantity");
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                
                  <Form.Group id="lastName">
                    <Form.Label>Unit Price</Form.Label>
                    <CurrencyInput
                      id="input-example"
                      name="input-name"
                      className="form-control"
                      placeholder="Unit cost Price"
                      decimalsLimit={2}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "unit_price");
                      }}
                    />
                    
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                <Form.Group className="mb-2">
                        <Form.Label>Select Supplier</Form.Label>
                        <AsyncSelect
                          cacheOptions
                          defaultOptions
                          loadOptions={this.loadSuppliers}
                          onInputChange={this.handleInputChange}
                          onChange={async (property, value) => {
                            console.log(property);
                            await this.setState({
                              supplier: property.value,
                              selectedTitle: property.label,
                            });
                          }}
                        />
                      </Form.Group>
                  
                </Col>
                
                <div className="mt-3">
                  <div>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={saving}
                      onClick={this.onSaveStock}
                    >
                      Save Purchase order
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

export default AddStock;
