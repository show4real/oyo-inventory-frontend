import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "reactstrap";
import { getbrands } from "../../services/brandService";
import { toast } from "react-toastify";
import AddBrands from "../products/AddBrands";
import EditBrand from "./EditBrand";
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

export class BrandIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      brands: [],
      value:"",
      total: 0,
    }
  }

  componentDidMount() {
   this.getBrands();
  }
  

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  };
  getBrands = () => {

    const { page, rows, search} = this.state;
    this.setState({ loading: true });
    getbrands({ page, rows, search }).then(
      (res) => {
        this.setState({
          loading: false,
          brands:res.brands.data,
          total:res.brands.total
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  

  toggleAddBrands = () => {
    this.setState({ addBrands: !this.state.addBrands });
  };
  
  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  toggleEdit = (editBrand) => {
    this.setState({ editBrand });
  };

  
  
  render() {
    const {
      brands,
      total,
      addBrands,
      editBrand,
      rows,
      search,
      loading,
      filtering
    } = this.state;
    return (
      <>
      
        {addBrands && (
          <AddBrands
            saved={this.getBrands}
            addBrands={addBrands}
            toggle={() => this.setState({ addBrands: null })}
          />
        )}

        {editBrand && (
          <EditBrand
            saved={this.getBrands}
            editBrand={editBrand}
            toggle={() => this.setState({ editBrand: null })}
          />
        )}

       

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
                  <Breadcrumb.Item href="#products">products</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => this.toggleAddBrands()}
                  >
                    Create Brands
                  </Button>
                  <Button variant="outline-primary" size="sm"  
                  onClick={() => {this.props.history.push('/products')}}

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
            <h6>Brands({total})</h6>
           
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
                    this.getBrands();
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
                onClick={this.getBrands}
              >
                <i className="fa fa-search" />
              </Button>
            </div>
          </Col>
        </Row>
        
        <Card border="light" className="shadow-sm mb-4">
          
          <Card.Body className="pb-0">
            <Table
              responsive
              className="table-centered table-nowrap rounded mb-0"
            >
              <thead className="thead-light">
                <tr>
                  <th className="border-0">Brand</th>
                  <th className="border-0">No of Products</th>
                </tr>
              </thead>
              <tbody>
            
                {brands.map((brand, key) => {
                  return (
                    <tr key={key}>
                      <td>{brand.name}</td>
                      <td>{brand.products_count}</td>
                      <td>
                            <Button
                              color="secondary"
                              onClick={() => this.toggleEdit(brand)}
                              size="sm"
                            >
                              Edit
                            </Button>
                      </td>
                      
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default BrandIndex;
