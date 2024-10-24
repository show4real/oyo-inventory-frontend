import React, { Component } from "react";

export class AddStock extends Component {
    constructor(props) {
        super(props);
        this.state = {
          search: "",
          page: 1,
          rows: 10,
          loading: false,
          tags: [],
          attributes:props.attributes,
          suppliers:props.suppliers
        };
        this.onTagsChanged = this.onTagsChanged.bind(this);
    }
    toggleEdit = () => {
        const { initialProduct } = this.state;
        this.setState({ edit: !this.state.edit, stock: { ...initialProduct } });
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
    
      onSaveStock = async (e) => {
        e.preventDefault();
        await toast.dismiss();
        const { stock, validation, product_attributes_values } = this.state;
        const { stock_quantity, unit_price, supplier } = stock;
        await this.setState({
          validation: {
            ...validation,
            product_attributes_values: product_attributes_values.length !== 0,
            stock_quantity:
              stock.stock_quantity !== undefined || stock.stock_quantity === null,
            unit_price: stock.unit_price !== undefined || stock.unit_price === null,
            supplier: stock.supplier !== undefined || stock.supplier === null,
          },
        });
        console.log(this.state.validation.stock_quantity);
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
    
        const { product_attributes_values, stock, product } = this.state;
    
        let attribute_values = "";
        let attribute_keys = "";
        let data = new FormData();
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
        data.set("unit_price", stock.unit_price);
        data.set("product_id", product.id);
        data.set("stock_quantity", stock.stock_quantity);
        data.set("supplier", stock.supplier);
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
            this.getProduct(this.state.product.id);
            this.props.saved;
            this.showToast("Stock created");
          })
          .catch((err) => {
            console.log(err);
            this.setState({
              errorMessage: err.response.data,
              show: true,
            });
            if (this.state.errorMessage) {
              this.showToast(this.state.errorMessage);
            }
            this.setState({ saving: false });
          });
      };
    
      onChange = (e, state) => {
        const { stock } = this.state;
    
        this.setState({ stock: { ...stock, [state]: e } });
        console.log(stock);
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
  render() {
      const{suppliers}=this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={addBrands != null}
          toggle={() => !loading && !saving && toggle}
        >
          {loading && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <ButtonGroup>
                <Button variant="outline-success" size="sm">
                  create brands
                </Button>
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
                    <Col className="text-right" md={12}>
                      {stock && (
                        <Button
                          variant={edit ? "primary" : "secondary"}
                          onClick={this.toggleEdit}
                          size="sm"
                        >
                          {edit ? "Discard Changes" : "Create stock"}
                        </Button>
                      )}
                    </Col>
                  </Row>
                  {attributes.map((attribute, key) => {
                    return (
                      <Row>
                        <Col md={9} className="mb-3">
                          <Form.Group className="mb-2">
                            <Form.Label>Select {attribute.name}</Form.Label>

                            <Form.Select
                              id="state"
                              disabled={!edit}
                              required
                              name={`${attribute.name}`}
                              onChange={this.handleChange}
                              style={{
                                marginRight: 10,
                                width: "100%",
                                color:
                                  validation.product_attributes_values === false
                                    ? "red"
                                    : null,
                              }}
                            >
                              <option value="">choose {attribute.name} </option>
                              {attribute.attributevalues.map((p, index) => (
                                <option value={p.attribute_value} key={p}>
                                  {p.attribute_value}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Button
                            variant="outline-success"
                            size="sm"
                            style={{ marginTop: "30px" }}
                            onClick={() => this.toggleAttributeValue(attribute)}
                          >
                            Add options to {attribute.name}
                          </Button>
                        </Col>
                      </Row>
                    );
                  })}
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group id="lastName">
                    <Form.Label>Stock Unit</Form.Label>

                    <Form.Control
                      type="number"
                      disabled={!edit}
                      placeholder="Stock Quantity"
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "stock_quantity");
                      }}
                    />
                    {console.log(validation.stock_quantity)}
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group id="lastName">
                    <Form.Label>Unit Price</Form.Label>
                    <Form.Control
                      type="number"
                      disabled={!edit}
                      placeholder="Stock Unit Price"
                      style={{
                        marginRight: 10,
                        width: "100%",
                        color: validation.unit_price === false ? "red" : null,
                      }}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "unit_price");
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group id="lastName">
                    <Form.Label>Supplier</Form.Label>
                    <Form.Select
                      required
                      disabled={!edit}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "supplier");
                      }}
                    >
                         <option value="">choose supplier</option>
                        {suppliers.map((p, index) => (
                            <option value={p.id} key={p}>
                            {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <div className="mt-3">
                  {edit && (
                    <div>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={saving}
                        onClick={this.onSaveStock}
                      >
                        Save Stock
                      </Button>
                    </div>
                  )}
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
