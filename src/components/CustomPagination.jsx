import React from "react";

import {
  Pagination,
  PaginationLink,
  PaginationItem
} from "reactstrap";

class CustomPagination extends React.Component {
  render() {
    const {page, rows, total, onPage, range} = this.props;
    const pages = Math.ceil(total/rows)
    const first = () => {
      if(page===1){
        return 1;
      } else if(page===pages&&pages>2){
        return page - 2;
      } else {
        return page - 1;
      }
    }
    const middle = () => {
      if(pages===1){
        return null;
      } else if(page===1){
        return 2;
      } else if(page===pages&&pages>2){
        return page - 1;
      } else {
        return page;
      }
    }

    const middle2 = () => {
      if(pages===1){
        return null;
      } else if(page===1){
        return 3;
      } else if(page===pages&&pages>3){
        return page - 2;
      } else {
        return page;
      }
    }
    
    const last = () => {
      if(pages<4){
        return null;
      } else if(page===1){
        return 4;
      } else if(page===pages&&pages>4){
        return page;
      } else {
        return page + 1;
      }
    }
    const last2 = () => {
      if(pages<4){
        return null;
      } else if(page===1){
        return 4;
      } else if(page===pages&&pages>2){
        return page;
      } else {
        return page + 1;
      }
    }

    const last3 = () => {
      if(pages<5){
        return null;
      } else if(page===1){
        return 5;
      } else if(page===pages&&pages>2){
        return page;
      } else {
        return page + 1;
      }
    }
    //console.log({page, rows, total, pages})
    return (
      <>
        <nav aria-label="...">
          <Pagination
            className="pagination justify-content-center mb-0"
            listClassName="justify-content-center mb-0"
          >
            <PaginationItem className={page===1?"disabled":''}>
              <PaginationLink
                href="#p"
                onClick={e => onPage(page-1)}
                tabIndex="-1"
              >
                <i className="fas fa-angle-left" />
                <span className="sr-only">Previous</span>
              </PaginationLink>
            </PaginationItem>
            <PaginationItem className={page===1?'active':''}>
              <PaginationLink
                onClick={e => page===first()?e.preventDefault():onPage(first())}
              >
                {first()}
              </PaginationLink>
            </PaginationItem>
            {middle()&&<PaginationItem className={page===middle()?'active':''}>
              <PaginationLink
                onClick={e => page===middle()?e.preventDefault():onPage(middle())}
              >
                {middle()}
              </PaginationLink>
            </PaginationItem>}
            {middle2()&&<PaginationItem className={page===middle2()?'active':''}>
              <PaginationLink
                onClick={e => page===middle2()?e.preventDefault():onPage(middle2())}
              >
                {middle2()}
              </PaginationLink>
            </PaginationItem>}
            {last()&&<PaginationItem className={page===last()?'active':''}>
              <PaginationLink
                onClick={e => page===last()?e.preventDefault():onPage(last())}
              >
                {last()}
              </PaginationLink>
            </PaginationItem>}
            

            <PaginationItem className={page===pages?"disabled":''}>
              <PaginationLink
                onClick={e => onPage(page+1)}
              >
                <i className="fas fa-angle-right" />
                <span className="sr-only">Next</span>
              </PaginationLink>
            </PaginationItem>
          </Pagination>
          {range&&<span style={{fontSize: 11.5, color: '#ccc', display: 'flex', marginTop: 8}} className="justify-content-center">{range} of {total}</span>}
        </nav>
      </>
    );
  }
}

export default CustomPagination;
