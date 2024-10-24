import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CardHeader,
  Media,
  Input,
  Badge,
} from "reactstrap";
import {
  faAngleDown,
  faAngleUp,
  faCheck,
  faCog,
  faHome,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import {
  Col,
  Row,
  Card,
  Table,
  Button,
  ButtonGroup,
  Breadcrumb,
} from "@themesberg/react-bootstrap";

import SpinDiv from "../components/SpinDiv";
import AddAward from "./AddAward";
import moment from "moment";
import { throttle,debounce } from "./debounce";
import 'antd/dist/antd.css';
import { Pagination } from 'antd';
import EditAward from "./EditAward";
import { getAwards } from "../../services/awardService";

export class AwardIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      employees: [],
      award_types:[],
      awards:[],
      total: 0,

    

    };
    this.searchDebounced = debounce(this.searchAwards, 500);
    this.searchThrottled = throttle(this.searchAwards, 500);
  }

  componentDidMount() {
    this.searchAwards();
  }

  

  searchAwards = () => {
    const { page, rows, search, awards } = this.state;
    this.setState({ loading: true });
    getAwards({ page, rows, search, awards }).then(

      (res) => {
        this.setState({
          awards: res.awards.data,
          employees: res.employees,
          award_types:res.award_types,
          page: res.awards.current_page,
          total: res.awards.total,
          loading: false,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

 

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  onPage = async (page,rows) => {
    await this.setState({page,rows});
    await this.getAwards();
  }
  
  handleSearch = event => {
    this.setState({ search: event.target.value }, () => {
      if(this.state.search < 5){
        this.searchThrottled(this.state.search);
      }else{
        this.searchDebounced(this.state.search);
      }
    
    });
  };
  
 

  toggleEditAward = (editAward) => {
    this.setState({ editAward});
    this.searchAwards();
   
  };
  toggleCloseAward=(editAward)=>{
    this.setState({ editAward: !this.state.editAward });
  }

 

  toggleAddAward = () => {
    this.setState({ addAward: !this.state.addAward });
    this.searchAwards();
  }

  
  



  




  

  render() {
    const { employees,award_types, awards, award, total, page, rows, search, loading,addAward, editAward } = this.state;
    
    return (
      <>
       
        
        {addAward && (
          <AddAward
            saved={this.searchAwards}
            employees={employees}
            award_types={award_types}
            toggle={this.toggleAddAward}
            
          />
        )}

        {editAward && (
          <EditAward
            saved={this.searchAwards}
            employees={employees}
            award={editAward}
            award_types={award_types}
            toggle={this.toggleCloseAward}
          />
        )}

        
        {/* {deleteTraining && (
          <DeleteTraining
            saved={this.searchAwards}
            deleteTraining={deleteTraining}
            toggle={this.toggleCloseDelete}
          />
        )} */}

      
       
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
                  <Breadcrumb.Item href="#users">Awards</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  <Button variant="outline-primary" size="sm" onClick={() => this.toggleAddAward()}>
                    Create Award
                  </Button>
                  <Button variant="outline-primary" onClick={() => {this.props.history.push('/awardtypes')}}  size="sm">
                    Create Award Types
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg="8">
          <h5 className="mb-0">Awards
          <span style={{color: '#aaa', fontSize: 14, fontWeight: 'normal'}}> ({total})</span></h5>
          </Col>
          <Col lg="4" className="">
            <div style={{ display: "flex" }}>
              <Input
                placeholder="Search..."
                autoFocus
                id="show"
                value={search}
                style={{ maxHeight: 45, marginRight: 5, marginBottom: 10 }}
                onChange={this.handleSearch}
                
              />
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
                  <th className="border-0">Employees</th>
                  <th className="border-0">Title</th>
                  <th className="border-0">Date</th>
                  <th className="border-0">actions</th>
                </tr>
              </thead>
              <tbody>
                
                {awards.map((award, key) => {
               
                  return (
                    <tr >
                      <td>
                        <span style={{fontWeight:"bold",textTransform:"capitalize"}}>{award.name}</span>
                      </td>
                      <td>
                        <span style={{fontWeight:"bold",textTransform:"capitalize"}}>{award.title}</span>
                      </td>
                        
                    
                      <td>{moment(award.dated).format('MMM D, YYYY')}</td>
      
                    
                      <td>
                        
                        <ButtonGroup>
                          <Button variant="outline-primary" style={{fontWeight:"bold",textTransform:"capitalize"}} onClick={() => this.toggleEditAward(award)} size="sm">view</Button>
                          
                        </ButtonGroup>
                      </td>

                      
                      
                    </tr>
                  );
                })}
              </tbody>
             
            </Table>
            <Row>
              <Col md={12} style={{fontWeight:"bold",paddingTop:3}}>
              {awards.length > 0 && <Pagination
                  total={total}
                  showTotal={total => `Total ${total} awards for all Employees`}
                  onChange={this.onPage}
                  pageSize={rows}
                  current={page}
                />}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default AwardIndex;
