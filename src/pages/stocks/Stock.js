import React, { Component } from "react"
import { toast } from "react-toastify";
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
import { faEnvelope, faPhone, faLock, faPencilAlt, faAddressCard, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "reactstrap";
import { Button, Tooltip } from "antd";

import Profile3 from "../../assets/img/team/profile-picture-3.jpg";
import SpinDiv from "../components/SpinDiv";
import axios from "axios";
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";
import { getSingleStock } from "../../services/stockService";
import { getProduct } from "../../services/productService";
import moment from "moment";
import { formatCurrency, format } from "../../services/formatCurrencyService";
import EditSerial from "./EditSerial";
import ReturnStock from "./ReturnStock";
import { Pagination } from 'antd';
import { getCompany } from "../../services/companyService";

export class Stock extends Component {
  constructor(props) {
    super(props);


    this.state = {
      loading: false,
      change: false,
      submitted: false,
      product: {},
      attributes: [],
      attribute_col: [],
      validation: {},
      product_attributes_values: [],
      stock: '',
      serial_no: '',
      serial_nos: [],
      validation: {},
      company:{},
      id: props.match.params.id,
      product_id: props.match.params.product_id,
      rows: 10,
      page: 1,
      total: 0,
      user: JSON.parse(localStorage.getItem('user')),
    };

  }

  componentDidMount() {
    this.getProduct();
    this.getStock();
    this.getCompany();
  }


  toggleAddAttribute = () => {
    this.setState({ addAttributes: !this.state.addAttributes });
  };

  getProduct = () => {
    const { product_id } = this.state;
    this.setState({ loading: true });
    getProduct(product_id).then(
      (res) => {
        this.setState({
          loading: false,
          product: res.product,
          attributes: res.attributes,
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


  getStock = () => {
    const { product_id, id, rows, page } = this.state;
    console.log(page)
    this.setState({ loading: true })
    getSingleStock({ product_id, id, rows, page }).then(
      (res) => {

        this.setState({
          loading: false,
          stock: res.stock,
          serial_nos: res.serials.data,
          page: res.serials.current_page,
          total: res.serials.total,
          attributes: res.attributes,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  getCompany = () => {
    const { product_id, id, rows, page } = this.state;
    console.log(page)
    this.setState({ loading: true })
    getCompany().then(
      (res) => {

        this.setState({
          loading: false,
          company: res.company,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };



  onPage = async (page, rows) => {
    console.log(page)
    await this.setState({ page, rows });
    await this.getStock();
  }





  formatNumber = (number) => {
    return format(number);
  }


  formatC = (x) => {
    return formatCurrency(x)
  }

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };

  onSave = async (e) => {
    e.preventDefault();

    await toast.dismiss();
    const { serial_nos, validation } = this.state;
    console.log(serial_nos)

    this.setState({ submitted: true });
    let check_serial_no = serial_nos.some(ele => ele.serial_no === null);


    if (!check_serial_no) {
      this.setState({ submitted: false })
      this.saveSerial();
    } else {
      const errorss = Object.keys(this.state.validation).filter((id) => {
        return !this.state.validation[id];
      });
      toast.dismiss();
    }
  };

  saveSerial = () => {
    this.setState({ saving: true });

    const { serial_nos, id } = this.state;

    let data = new FormData();
    data.set('id', id)
    for (var i in serial_nos) {
      data.set(`stock_id[${i}]`, serial_nos[i].stock_id);
      data.set(`serial_id[${i}]`, serial_nos[i].serial_id);
      data.set(`serial_no[${i}]`, serial_nos[i].serial_no);

    }

    return axios
      .post(
        `${settings.API_URL}saveserial`,
        data,
        {
          headers: authHeader(),
        },
        authService.handleResponse
      )
      .then((res) => {
        this.setState({ saving: false, edit: false });
        this.getStock(id);

        this.showToast("Serial No saved");
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


  attributeCols = (pd) => {
    let temp = new Array();
    temp = pd.split(",");

    return temp.map((attrs, key) => {
      return (
        <td>{attrs.replace(/^"(.*)"$/, "$1").replace(/^"(.*)"$/, "$1")}</td>
      );
    });
  };



  handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const { serial_nos } = this.state;
    const list = [...serial_nos];
    list[index][name] = value;
    this.setState({ serial_nos: list });
  };
  toggleEditSerial = (editSerial) => {
    this.setState({ editSerial })
  }

  toggle = () => {
    this.setState({ editSerial: !this.state.editSerial });
    this.getStock()
  }

  toggleCloseStock = () => {
    this.setState({ returnStock: !this.state.returnStock });
    this.getStock()
  }



  // addSerialNo=()=>{
  //   const {stock}= this.state;
  //   let text = [];
  //   for (let i = 1; i <= stock.stock_quantity; i++) {
  //     text.push(

  //       <Row>
  //         <Col md={6}>
  //           <Form.Group>
  //             <Form.Label>S/N</Form.Label>
  //             <Input 
  //               type="text"
  //               value={i}
  //             />
  //           </Form.Group>
  //         </Col>
  //         <Col md={6}>
  //           <Form.Group>
  //             <Form.Label>Serial No</Form.Label>
  //             <Input 
  //               type="text"
  //               vale={i}
  //               name="serial_no"
  //               onChange={e => this.handleInputChange(e, key)}
  //             />
  //           </Form.Group>
  //         </Col>
  //       </Row>
  //     );

  //   }
  //   return text;

  // }


  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  toggleReturnStock = (stock) => {
    this.setState({ returnStock: stock })
  }



  render() {
    const {

      serial_nos,
      saving,
      stock,
      user,
      company,
      attributes,
      loading,
      editSerial,
      returnStock,
      submitted,
      rows,
      page,
      total
    } = this.state;

    const Required = () => <span style={{ color: "red" }}>*</span>;
    return (
      <>
        {editSerial && (
          <EditSerial
            serial={editSerial}
            toggle={this.toggle}
          />
        )}

        {returnStock && (
          <ReturnStock
            serial={returnStock}
            toggle={this.toggleCloseStock}
          />
        )}
       

        <Row>
          <Col lg="7">
            <h3>Stock</h3>

          </Col>
          {loading && <SpinDiv text={"Loading..."} />}
        </Row>

        {stock && (
          <Row>

            <Col md={9}>
              <Row>
                <h5 style={{ paddingTop: "15px" }}>Order Overview</h5>
                <Col xs={12}>
                  <Card.Body className="bg-white shadow-sm mb-4">
                    <Table
                      responsive
                      className="table-centered table-nowrap rounded mb-0"
                      style={{ fontWeight: 'bold' }}
                    >
                      <thead className="thead-light">
                        <tr>
                          <th className="border-0">Product</th>
                          <th className="border-0">Purchase ID</th>

                          <th className="border-0">Instock</th>
                          <th className="border-0">Returned</th>
                          <th className="border-0">Sold</th>

                          <th className="border-0">Order unit</th>
                          <th className="border-0">Unit Price</th>
                          <th className="border-0">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          <tr>
                            <td>{stock.order.product_name}</td>
                            <td>{stock.tracking}</td>

                            <td>{this.formatNumber(stock.in_stock)}</td>
                            <td>{this.formatNumber(stock.quantity_returned)}</td>
                            <td>{this.formatNumber(stock.quantity_sold)}</td>
                            <td>{this.formatNumber(stock.stock_quantity)}</td>
                            <td>{this.formatC(stock.order.unit_selling_price)}</td>
                            <td><Button
                              variant="outline-primary"
                              type="submit"
                              disabled={saving}
                              onClick={() => this.toggleReturnStock(stock)}
                            >
                              Return Order
                            </Button></td>
                          </tr>
                        }
                      </tbody>
                    </Table>
                    <Row>
                      <h5 style={{ paddingTop: "15px" }}>variants</h5>
                      <Table
                        responsive
                        className="table-centered table-nowrap rounded mb-0"
                      >
                        <thead className="thead-light">
                          <tr>
                            {attributes.map((attribute, key) => {
                              return (
                                <th className="border-0">{attribute.name}</th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {
                            <tr>
                              {console.log(stock.order.product_attributes)}
                              {this.attributeCols(
                                `${stock.order.product_attributes}`
                              )}
                            </tr>
                          }
                        </tbody>
                      </Table>
                    </Row>

                  </Card.Body>
                </Col>
                {company.sell_by_serial_no == 1 && <Col md={9}>
                  <Row>

                    <Table
                      responsive
                      className="table-centered table-nowrap rounded mb-0"
                    >
                      <thead className="thead-light">
                        <tr>
                          <th className="border-0">S/N</th>

                          <th className="border-0">Product Serial No</th>
                          <th className="border-0">Status</th>
                          <th className="border-0">Action</th>

                        </tr>
                      </thead>
                      <tbody>
                        {serial_nos.map((serial, key) => (
                          <tr>



                            <td style={{ display: 'none' }}>
                              <Form.Group className="mb-2">
                                <InputGroup>
                                  <InputGroup.Text>
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                  </InputGroup.Text>
                                  <Input

                                    type="text"
                                    disabled
                                    name='stock_id'
                                    value={serial.stock_id}
                                    onChange={e => this.handleInputChange(e, key)}
                                  />
                                </InputGroup>
                              </Form.Group>

                            </td>
                            <td style={{ display: 'none' }} >
                              <Form.Group className="mb-2">
                                <InputGroup>
                                  <InputGroup.Text>
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                  </InputGroup.Text>
                                  <Input

                                    type="text"
                                    disabled
                                    name="serial_id"


                                    value={serial.id}
                                    onChange={e => this.handleInputChange(e, key)}
                                  />
                                </InputGroup>
                              </Form.Group>

                            </td>
                            <td >

                              <Form.Group className="mb-2">
                                <Form.Label></Form.Label>
                                <InputGroup>
                                  <InputGroup.Text>
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                  </InputGroup.Text>
                                  <Input

                                    type="text"
                                    disabled
                                    // <td>{{ ($users->currentpage()-1) * $users->perpage() + $key + 1 }}</td>
                                    value={((page - 1) * rows) + key + 1}

                                  />
                                </InputGroup>
                              </Form.Group>

                            </td>
                            <td>
                              <Form.Group className="mb-2">
                                <Form.Label></Form.Label>
                                <Tooltip style={{fontWeight:'bold'}}title={serial.serial_no !== null ? serial.serial_no :'No Serial'} color='red'>
                                <InputGroup>
                                  <InputGroup.Text>
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                  </InputGroup.Text>

                                  <Input

                                    type="text"
                                    placeholder={`Serial No`}
                                    //placeholder={`Item Price ${key + 1}`}
                                    disabled
                                    value={serial.serial_no || ''}
                                    onChange={e => this.handleInputChange(e, key)}
                                    name='serial_no'
                                  />
                                </InputGroup>
                                </Tooltip>
                              </Form.Group>
                              {submitted && !serial.serial_no && (
                                <div style={{ color: "red" }}>Serial is required</div>
                              )}

                            </td>
                            <td>
                              <tr>
                                <Form.Group className="mb-2">
                                  <Form.Label> </Form.Label>
                                  
                                  <InputGroup>
                                    <InputGroup.Text>
                                      <FontAwesomeIcon icon={faPencilAlt} />
                                    </InputGroup.Text>

                                    <Input

                                      type="text"
                                      placeholder={`Serial No`}
                                      value={serial.sold_at !== null ? 'Sold' : 'Available'}
                                      disabled
                                    />
                                  </InputGroup>




                                </Form.Group>
                              </tr>

                            </td>
                            {/* <td>

                              <tr>
                                <Form.Group className="mb-2">
                                  <Form.Label></Form.Label>
                                  <InputGroup>


                                    <Button onClick={() => {//console.log('111')
                                      this.toggleEditSerial(serial)
                                    }}>
                                      Edit
                                    </Button>
                                  </InputGroup>

                                </Form.Group>
                              </tr>

                            </td> */}

                          </tr>
                        ))}

                      </tbody>


                    </Table>
                    {/* <Row>
                              {serial_nos[0].serial_no === null && 
                                <Col md={6}>
                                  <ButtonGroup>
                                    <Button variant="primary" type="button" disabled={saving} size="sm"
                                        onClick={this.onSave}
                                    >
                                        Save
                                    </Button>
                                    
                                </ButtonGroup>
                              </Col>}
                              
                            </Row> */}
                    <Row>
                      <Col md={12} style={{ fontWeight: "bold", paddingTop: 3 }}>
                        {serial_nos.length > 0 && <Pagination
                          total={total}
                          showTotal={total => `Total ${total} serials`}
                          onChange={this.onPage}
                          pageSize={rows}
                          current={page}

                        />}
                      </Col>
                    </Row>


                  </Row>
                </Col>
                }

              </Row>
            </Col>
          </Row>
        )}
      </>
    );
  }
}

export default Stock;
