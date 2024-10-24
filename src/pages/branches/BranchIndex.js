import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "reactstrap";
import { getBranches } from "../../services/branchService";
import { toast } from "react-toastify";
import AddBranches from "../products/AddBranches";
import { Pagination } from 'antd';

import EditBranch from "./EditBranch";
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

export class BranchIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      branches: [],
      value:"",
      total: 0,
    }
  }

  componentDidMount() {
   this.getBranches();
  }
  

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  };
  getBranches = () => {

    const { page, rows, search} = this.state;
    this.setState({ loading: true });
    getBranches({ page, rows, search }).then(
      (res) => {
        this.setState({
          loading: false,
          branches:res.branches.data,
          total:res.branches.total
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };
  onPage = async (page, rows) => {
    await this.setState({ page, rows });
    await this.getBranches();
  }

  

  toggleAddBranch = () => {
    this.setState({ addBranches: !this.state.addBranches });
  };
  
  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  toggleEdit = (editBranch) => {
    this.setState({ editBranch });
  };

  
  
  render() {
    const {
      branches,
      total,
      addBranches,
      editBranch,
      page,
      rows,
      search,
      loading,
      filtering
    } = this.state;
    return (
      <>
      
        {addBranches && (
          <AddBranches
            saved={this.getBranches}
            addBranches={addBranches}
            toggle={() => this.setState({ addBranches: null })}
          />
        )}

        {editBranch && (
          <EditBranch
            saved={this.getBranches}
            editBranch={editBranch}
            toggle={() => this.setState({ editBranch: null })}
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
                    onClick={() => this.toggleAddBranch()}
                  >
                    Create Branches
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
            <h6>Branches({total})</h6>
           
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
                    this.getBranches();
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
                onClick={this.getBranches}
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
                  <th className="border-0">Branch</th>
                  <th className="border-0">Branch ID</th>
                  <th className="border-0">No of stocks</th>
                </tr>
              </thead>
              <tbody>
            
                {branches.map((branch, key) => {
                  return (
                    <tr key={key}>
                      <td>{branch.name}</td>
                      <td>{branch.branch_id}</td>
                      <td>{branch.stocks_count}</td>
                      <td>
                            <Button
                              color="secondary"
                              onClick={() => this.toggleEdit(branch)}
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
            <Row>
                  <Col md={12} style={{ fontWeight: "bold", paddingTop: 3 }}>
                    {branches.length > 0 ? <Pagination
                      total={total}
                      showTotal={total => `Total ${total} branches`}
                      onChange={this.onPage}
                      pageSize={rows}
                      current={page}
                    /> :  <div style={{color: '#ccc', alignSelf: 'center', padding: 10, fontSize: 13}}>
                    <i className="fa fa-ban" style={{marginRight: 5}}/>
                    No Branch found
                  </div>}
                  </Col>
                </Row>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default BranchIndex;
