import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "reactstrap";
import { getcategories } from "../../services/categoryService";
import { toast } from "react-toastify";
import AddCategories from "../products/AddCategories";
import EditCategory from "./EditCategory";
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

export class CategoryIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      categories: [],
      value:"",
      total: 0,
    }
  }

  componentDidMount() {
   this.getCategories();
  }
  

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  };
  getCategories = () => {

    const { page, rows, search} = this.state;
    this.setState({ loading: true });
    getcategories({ page, rows, search }).then(
      (res) => {
        this.setState({
          loading: false,
          categories:res.categories.data,
          total:res.categories.total
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  

  toggleAddCategories = () => {
    this.setState({ addCategories: !this.state.addCategories });
  };
  
  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  toggleEdit = (editCategory) => {
    this.setState({ editCategory });
  };

  
  
  render() {
    const {
      categories,
      total,
      addCategories,
      editCategory,
      rows,
      search,
      loading,
      filtering
    } = this.state;
    return (
      <>
      
        {addCategories && (
          <AddCategories
            saved={this.getCategories}
            addCategories={addCategories}
            toggle={() => this.setState({ addCategories: null })}
          />
        )}

        {editCategory && (
          <EditCategory
            saved={this.getCategories}
            editCategory={editCategory}
            toggle={() => this.setState({ editCategory: null })}
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
                  <Breadcrumb.Item href="#products">Categories</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => this.toggleAddCategories()}
                  >
                    Create Categories
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
            <h6>Categories({total})</h6>
           
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
                    this.getCategories();
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
                onClick={this.getCategories}
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
                  <th className="border-0">Categories</th>
                  <th className="border-0">No of Products</th>
                </tr>
              </thead>
              <tbody>
            
                {categories.map((category, key) => {
                  return (
                    <tr key={key}>
                      <td>{category.name}</td>
                      <td>{category.products_count}</td>
                      <td>
                            <Button
                              color="secondary"
                              onClick={() => this.toggleEdit(category)}
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

export default CategoryIndex;
