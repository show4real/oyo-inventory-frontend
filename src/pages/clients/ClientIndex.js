import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CardHeader, Media, Input, Badge } from "reactstrap";
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
import { throttle, debounce } from "../invoice/debounce";
import "antd/dist/antd.css";
import { Pagination } from "antd";
import { EditClient } from "./EditClient";
import { getClients } from "../../services/clientService";
import AddClient from "./AddClient";
import { addClient } from "../../services/invoiceService";

export class ClientIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      clients: [],
      total: 0,
    };
    this.searchDebounced = debounce(this.searchClients, 500);
    this.searchThrottled = throttle(this.searchClients, 500);
  }

  componentDidMount() {
    this.searchClients();
  }

  searchClients = () => {
    const { page, rows, search, clients } = this.state;
    this.setState({ loading: true });
    getClients({ page, rows, search, clients }).then(
      (res) => {
        this.setState({
          clients: res.clients.data,

          page: res.clients.current_page,
          total: res.clients.total,
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

  onPage = async (page, rows) => {
    await this.setState({ page, rows });
    await this.searchClients();
  };

  handleSearch = (event) => {
    this.setState({ search: event.target.value }, () => {
      if (this.state.search < 5) {
        this.searchThrottled(this.state.search);
      } else {
        this.searchDebounced(this.state.search);
      }
    });
  };

  toggleEditClient = (editClient) => {
    this.setState({ editClient });
    this.searchClients();
  };
  toggleCloseClient = (editClient) => {
    this.setState({ editClient: !this.state.editClient });
  };

  toggleAddClient = () => {
    this.setState({ addClient: !this.state.addClient });
    this.searchClients();
  };

  render() {
    const {
      clients,
      total,
      page,
      rows,
      search,
      loading,
      addClient,
      editClient,
    } = this.state;

    return (
      <>
        {addClient && (
          <AddClient
            saved={this.searchClients}
            addClient={addClient}
            toggle={this.toggleAddClient}
          />
        )}

        {editClient && (
          <EditClient
            saved={this.searchClients}
            client={editClient}
            toggle={this.toggleCloseClient}
          />
        )}

        {/* {deleteTraining && (
          <DeleteTraining
            saved={this.searchClients}
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
                  <Breadcrumb.Item href="#clients">Clients</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => this.toggleAddClient()}
                  >
                    Create Client
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg="8">
            <h5 className="mb-0">
              Clients
              <span
                style={{ color: "#aaa", fontSize: 14, fontWeight: "normal" }}
              >
                {" "}
                ({total})
              </span>
            </h5>
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
                  <th className="border-0">Name</th>
                  <th className="border-0">Email</th>
                  <th className="border-0">Phone</th>
                  <th className="border-0">actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, key) => {
                  return (
                    <tr>
                      <td>
                        <span
                          style={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}
                        >
                          {client.name}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}
                        >
                          {client.email}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}
                        >
                          {client.phone}
                        </span>
                      </td>

                      <td>
                        <ButtonGroup>
                          <Button
                            variant="outline-primary"
                            style={{
                              fontWeight: "bold",
                              textTransform: "capitalize",
                            }}
                            onClick={() => this.toggleEditClient(client)}
                            size="sm"
                          >
                            view
                          </Button>
                          <Button
                            variant="outline-primary"
                            style={{
                              fontWeight: "bold",
                              textTransform: "capitalize",
                            }}
                            onClick={() => {
                              this.props.history.push(
                                "/client/payments/" + client.id
                              );
                            }}
                            size="sm"
                          >
                            Payments
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Row>
              <Col md={12} style={{ fontWeight: "bold", paddingTop: 3 }}>
                {clients.length > 0 && (
                  <Pagination
                    total={total}
                    showTotal={(total) =>
                      `Total ${total} clients for all Employees`
                    }
                    onChange={this.onPage}
                    pageSize={rows}
                    current={page}
                  />
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default ClientIndex;
