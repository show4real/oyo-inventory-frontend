import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faCartArrowDown,
  faChevronDown,
  faClipboard,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { ChoosePhotoWidget, ProfileCardWidget } from "../../components/Widgets";
import { getProduct, updateProduct } from "../../services/productService";
import AttributeOptions from "./AttributeOptions";
import styles from "../../assets/css/image.module.css";
import {
  getPurchaseOrders,
  addPurchaseorder,
} from "../../services/purchaseOrderService";
import { toast } from "react-toastify";
import moment from "moment";
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

import Profile3 from "../../assets/img/team/profile-picture-3.jpg";
import SpinDiv from "../components/SpinDiv";
import axios from "axios";
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";
import AddAttribute from "./AddAttribute";
import { addAttributes } from "../../services/attributeService";
import Resizer from "react-image-file-resizer";
import { addPImage } from "../../services/imageService";

export class SingleProduct extends Component {
  constructor(props) {
    super(props);
    const { location: state } = props;

    this.state = {
      loading: false,
      edit: false,
      editProduct: false,
      change: false,
      product: {},
      attributes: [],
      attribute_col: [],
      uploadImage: false,
      imageType: "",
      imageSize: "",
      validation: {},
      product_attributes_values: [],
      purchase_orders: [],
      // brands: [],
      categories: [],
      suppliers: [],
      validation: {},
      id: props.match.params.id,
    };
    this.fileChangedHandler = this.fileChangedHandler.bind(this);
  }

  componentDidMount() {
    this.getProduct();
    this.getPurchaseOrders();
  }

  fileChangedHandler(event) {
    var fileInput = false;
    if (event.target.files[0]) {
      fileInput = true;
      this.setState({
        imageType: event.target.files[0].type,
        imageSize: event.target.files[0].size,
      });
    }
    if (fileInput) {
      try {
        Resizer.imageFileResizer(
          event.target.files[0],
          300,
          300,
          "JPEG",
          100,
          0,
          (uri) => {
            console.log(uri);
            this.setState({ newImage: uri });
            //this.setState({imageType:event.target.files[0].type})
          },
          "base64",
          200,
          200
        );
      } catch (err) {
        console.log(err);
      }
    }
  }

  toggleAddAttribute = () => {
    this.setState({ addAttributes: !this.state.addAttributes });
  };

  getProduct = () => {
    const { id } = this.state;
    this.setState({ loading: true });
    getProduct(id).then(
      (res) => {
        console.log(res.attributes);
        this.setState({
          loading: false,
          product: res.product,
          attributes: res.attributes,
          suppliers: res.suppliers,
          // brands: res.brands,
          categories: res.categories,
          initialProduct: { ...res.product },
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  toggleAttributeValue = (addAttributeValue) => {
    this.setState({ addAttributeValue });
  };

  getPurchaseOrders = () => {
    const { id } = this.state;
    console.log(id);
    this.setState({ loading: true });
    getPurchaseOrders(id).then(
      (res) => {
        console.log(res);
        this.setState({
          loading: false,
          purchase_orders: res.purchase_orders.data,
          initialPurchaseOrders: { ...res.purchase_orders.data },
        });
        console.log(this.state.purchase_orders);
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  toggleEdit = () => {
    const { initialProduct } = this.state;
    this.setState({ edit: !this.state.edit, product: { ...initialProduct } });
  };

  toggleEditProduct = () => {
    const { initialProduct } = this.state;
    this.setState({ editProduct: !this.state.editProduct });
  };

  toggleUploadImage = () => {
    const { initialProduct } = this.state;
    this.setState({ uploadImage: !this.state.uploadImage });
  };

  validationRules = (field) => {
    // if (field === "brand_id") {
    //   return "Brand is required";
    // } else
    if (field === "name") {
      return "Product Name is required";
    } else if (field === "category_id") {
      return "Category is required";
    } else if (field === "description") {
      return "Description is required";
    }
  };

  validationRulesImg = (field) => {
    if (field === "data") {
      return "Image is required";
    } else if (field === "imageType") {
      return "Image Type is not valid";
    } else if (field === "imageSize") {
      return "Image Size must be 2mb or less";
    }
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };

  onSaveImage = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { newImage, imageType, imageSize, validation } = this.state;
    console.log(imageSize);
    console.log(imageType !== "image/jpeg");
    await this.setState({
      validation: {
        ...validation,
        data: newImage !== undefined || newImage === null,
        imageType: imageType === "image/jpeg" || imageType === "image/png",
        imageSize: imageSize / 1024 / 1024 <= 4,
      },
    });
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveImage();
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
              * {this.validationRulesImg(v)}
            </p>
          ))}
        </div>
      );
    }
  };

  saveImage = () => {
    this.setState({ savingImage: true });

    const { newImage, id } = this.state;
    console.log(id);
    addPImage({
      data: newImage,
      product_id: id,
    }).then(
      (res) => {
        console.log(res);
        this.setState({ loading: false, savingImage: false });
        toast.dismiss();
        toast.configure({ hideProgressBar: true, closeButton: false });
        toast(
          <div style={{ padding: "10px 20px" }}>
            <p style={{ margin: 0, fontWeight: "bold", color: "green" }}>
              Image uploaded
            </p>
          </div>
        );
        this.setState({ newImage: "", uploadImage: false });
        this.getProduct();
      },
      (error) => {
        toast.dismiss();
        toast.configure({ hideProgressBar: true, closeButton: false });
        toast(
          <div style={{ padding: "10px 20px" }}>
            <p style={{ margin: 0, fontWeight: "bold", color: "red" }}>
              *{error}
            </p>
          </div>
        );
        this.setState({ loading: false, savingImage: false });
      }
    );
  };
  attributeCols = (pd, pd2) => {
    if (pd !== null) {
      let attributes = [];
      let attribute_keys = [];
      attributes = pd.split(",");
      attribute_keys = pd2.split(",");

      return attributes.map((attrs, key) => {
        return <td>{attrs}</td>;
      });
    } else {
      return <td>No product variants</td>;
    }
  };
  onChange = (e, state) => {
    const { product } = this.state;
    this.setState({ product: { ...product, [state]: e } });
  };

  saveProduct = () => {
    this.setState({ loading: true });
    const { product, id } = this.state;
    const { category_id, description, name } = product;
    this.setState({ saving: true });
    updateProduct({
      id: id,
      name: product.name,
      // brand_id: product.brand_id,
      category_id: product.category_id,
      description: product.description,
    }).then(
      (res) => {
        console.log(res);
        this.setState({ loading: false, saving: false });
        toast.dismiss();
        toast.configure({ hideProgressBar: true, closeButton: false });
        toast(
          <div style={{ padding: "10px 20px" }}>
            <p style={{ margin: 0, fontWeight: "bold", color: "green" }}>
              Product updated
            </p>
          </div>
        );

        this.getProduct(id);
      },
      (error) => {
        console.log(error);
        this.setState({ loading: false });
      }
    );
  };

  onUpdateProduct = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { product, validation } = this.state;
    const { name, category_id, description } = product;
    await this.setState({
      validation: {
        ...validation,
        // brand_id: brand_id !== '',
        category_id: category_id !== "",
        name: name !== "",
        description: description !== "",
      },
    });
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveProduct();
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

  render() {
    const {
      product,
      purchase_orders,
      // brands,
      addAttributes,
      addAttributeValue,
      attributes,
      saving,
      savingImage,
      loading,
      edit,
      editProduct,
      uploadImage,
      categories,
    } = this.state;
    const { category_id, description, name } = product;
    const Required = () => <span style={{ color: "red" }}>*</span>;
    return (
      <>
        {addAttributeValue && (
          <AttributeOptions
            saved={this.getProduct}
            addAttributeValue={addAttributeValue}
            toggle={() => this.setState({ addAttributeValue: null })}
          />
        )}
        {addAttributes && (
          <AddAttribute
            saved={this.getProduct}
            product_id={product.id}
            addAttributes={addAttributes}
            toggle={() => this.setState({ addAttributes: null })}
          />
        )}
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
          <div className="d-flex">
            <ButtonGroup>
              {/* <Button variant="outline-primary" size="sm">
                Export
              </Button> */}
            </ButtonGroup>
          </div>
        </div>

        <Row>
          {/* <Col xs={12}>
            <Card.Body className="bg-white shadow-sm mb-4">
              <Row>
                <Col md={6}>
                  <ButtonGroup>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        this.props.history.push("/purchase_orders");
                      }}
                    >
                      create purchased order
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
              <Table
                responsive
                className="table-centered table-nowrap rounded mb-0"
              >
                <thead className="thead-light">
                  <tr>
                    <th className="border-0">Product</th>
                    <th className="border-0">Purchase Order unit</th>
                    <th className="border-0">Instock</th>
                    <th className="border-0">Unit Cost Price</th>
                    <th className="border-0">Date</th>

                    {attributes.length < 1 ? (
                      <th className="border-0">Variants</th>
                    ) : (
                      attributes.map((attribute, key) => {
                        return <th className="border-0">{attribute.name}</th>;
                      })
                    )}
                  </tr>
                </thead>
                <tbody>
                  {purchase_orders.map((purchase_order, key) => {
                    return (
                      <tr>
                        <td>{purchase_order.product_name}</td>
                        <td>{purchase_order.stock_quantity}</td>
                        <td>{purchase_order.in_stock}</td>
                        <td>{purchase_order.unit_price}</td>
                        <td>
                          {moment(purchase_order.created_at).format(
                            "MMM DD YYYY"
                          )}
                        </td>
                        {this.attributeCols(
                          JSON.parse(purchase_order.product_attributes),
                          JSON.parse(purchase_order.product_attributes_keys)
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Col> */}
          <Col xs={12} xl={7}>
            <Card border="light" className="bg-white shadow-sm mb-4">
              {loading && <SpinDiv text={"Loading..."} />}
              {saving && <SpinDiv text={"Saving..."} />}

              <Card.Body>
                <Row>
                  <Col className="text-right" md={12}>
                    {product && (
                      <ButtonGroup>
                        {/* <Button
                       variant="outline-primary"
                       size="sm"
                       onClick={() => this.toggleAddAttribute()}
                     >
                       Add Product Variant
                     </Button> */}
                        <Button
                          variant={editProduct ? "secondary" : "primary"}
                          onClick={this.toggleEditProduct}
                          size="sm"
                        >
                          {editProduct ? "Discard Changes" : "Edit Product"}
                        </Button>
                      </ButtonGroup>
                    )}
                  </Col>
                </Row>
                <h5 className="mb-4">Product Details</h5>

                <Form>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="firstName">
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          value={product.name}
                          disabled={!editProduct}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "name");
                          }}
                        />
                      </Form.Group>
                    </Col>
                    {/* <Col md={6} className="mb-3">
                      <Form.Group id="lastName">
                        <Form.Label>Brand</Form.Label>
                        <Form.Select
                          id="state"
                          required
                          value={product.brand_id}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "brand_id");
                          }}
                        >
                          <option value="">Select Brand</option>
                          {brands.map((p, index) => (
                            <option value={p.id} key={p}>
                              {p.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col> */}
                  </Row>
                  <Col md={6} className="mb-3">
                    <Form.Group id="phone">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        required
                        value={product.category_id}
                        onChange={async (e) => {
                          await this.onChange(e.target.value, "category_id");
                        }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((p, index) => (
                          <option value={p.id} key={p}>
                            {p.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="emal">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          value={product.description}
                          disabled={!editProduct}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "description");
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  {editProduct && (
                    <div className="mt-3">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={saving}
                        onClick={this.onUpdateProduct}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </Form>
                {/* <h5 className="mb-4">Product Variants</h5>

                <Table
                  responsive
                  className="table-centered table-nowrap rounded mb-0"
                >
                  <thead className="thead-light">
                    <tr>
                      <th className="border-0">Variants</th>
                      <th className="border-0">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributes &&
                      attributes.map((p, key) => {
                        return (
                          <tr>
                            <td>{p.name}</td>
                            <td>
                              {p.attributevalues.length !== 0
                                ? p.attributevalues.map((p, key) => {
                                    return p.attribute_value + ",";
                                  })
                                : "No options yet"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Table> */}
              </Card.Body>
            </Card>
            <Row></Row>
          </Col>

          <Col xs={12} xl={5}>
            <Row>
              <Col xs={12}>
                <Card border="light" className="bg-white shadow-sm mb-4">
                  {loading && <SpinDiv text={"Loading..."} />}
                  {savingImage && <SpinDiv text={"Saving..."} />}
                  <Card.Body>
                    <Row>
                      <h5>Product Image</h5>
                      <Col md={12}>
                        {product && (
                          <Button
                            variant={
                              uploadImage
                                ? "outline-secondary"
                                : "outline-primary"
                            }
                            onClick={this.toggleUploadImage}
                            style={{ marginBottom: 20 }}
                            size="sm"
                          >
                            {uploadImage
                              ? "cancel upload"
                              : product.product_image !== null
                              ? "change product image"
                              : "upload product image"}
                          </Button>
                        )}
                        {uploadImage && (
                          <div>
                            <div
                              style={{
                                fontFamily: "sans-serif",
                                textAlign: "center",
                                display: "flex",
                              }}
                            >
                              <label
                                style={{
                                  border: "1px solid #ccc",
                                  display: "inline-block",
                                  padding: "6px 12px",
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="file"
                                  style={{ display: "none" }}
                                  onChange={this.fileChangedHandler}
                                />
                                <i className="fa fa-cloud-upload" /> Choose
                                Image
                              </label>
                            </div>
                            <img src={this.state.newImage} alt="" />
                            <div className="mt-3">
                              <Button
                                variant="primary"
                                type="submit"
                                disabled={savingImage}
                                onClick={this.onSaveImage}
                              >
                                upload
                              </Button>
                            </div>
                          </div>
                        )}
                        <Row>
                          <Col md={12}>
                            {product.product_image !== null ? (
                              <img
                                style={{
                                  borderRadius: "5px",
                                  height: 300,
                                  width: 300,
                                  marginLeft: 10,
                                }}
                                src={product.product_image}
                              />
                            ) : (
                              ""
                            )}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </>
    );
  }
}

export default SingleProduct;
