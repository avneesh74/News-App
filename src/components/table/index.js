import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {sortBy} from 'lodash';

import {
  DEFAULT_QUERY,DEFAULT_PAGE, DEFAULT_HPP , PATH_BASE , PATH_SEARCH, PARAM_SEARCH , PARAM_PAGE, PARAM_HPP
}

const SORTS = {
  NONE: list=> list,
  TITLE: list=> sortBy(list,'title'),
  AUTHOR: list=> sortBy(list, 'author'),
  COMMENTS : list=> sortBy(list,'num_comments').reverse(),
  POINTS: list=> sortBy(list,'points').reverse(),
}

class Table extends Component {


  constructor (props){
    super(props);
    this.state = {
      results:null,
      searchKey:'',
      searchTerm : DEFAULT_QUERY,
      isLoading : false,
      sortKey:'NONE',
    }
    //bind the function to this (app component)
    this.removeItem = this.removeItem.bind(this);
    this.searchValue=this.searchValue.bind(this);
    this.fetchTopStories=this.fetchTopStories.bind(this);
    this.setTopStories = this.setTopStories.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onSort= this.onSort.bind(this);
  }
  // Sort function
  onSort(sortKey){
    this.setState({sortKey});
  }

  //set top Stories
  setTopStories(result){
    //get the  hits and page from result
    const {hits,  page } = result;
    // meaning page is not 0,button has clicked, page might be 1 or 2
    //old hits are already available in the state
  //  const oldHits = page !== 0 ? this.state.result.hits : [];
  const {searchKey, results}= this.state;
     const oldHits = results && results [searchKey]? results[searchKey].hits:[];
    const updatedHits = [...oldHits,...hits];
    this.setState({results:{...results,[searchKey]:{hits:updatedHits, page}},
      isLoading: false
    });


  }

  //fetch top stories
  fetchTopStories(searchTerm, page) {
    this.setState({isLoading:true});
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(response=> response.json())
    .then(result=> this.setTopStories (result))
    .catch(e=> e);
  }

  //component did mount
  componentDidMount(){
    this.setState({searchKey: this.state.searchTerm});
    this.fetchTopStories(this.state.searchTerm, DEFAULT_PAGE);
  }

  // on search submit function
  onSubmit(event){
    this.setState({searchKey: this.state.searchTerm});
    this.fetchTopStories(this.state.searchTerm, DEFAULT_PAGE);
    event.preventDefault();
  }



// lets rewrite removeItem finction in ES 6
removeItem(id){
//  const isNotId = ;
const {result} = this.state;
  const updatedList= result.hits.filter(item => item.objectID!==id);
  //this.setState({result: Object.assign({}, this.state.result, {hits: updatedList})});
  this.setState({result: {...result, hits:updatedList}} );
}

// get input field value from search form
searchValue (event){
   this.setState({searchTerm: event.target.value});
}

  render() {
    const {results,searchTerm, searchKey, isLoading, sortKey} = this.state;
    //if (!result) {return null}

    const page= (results && results[searchKey]&& results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
      <div>

      <Grid fluid>
         <Row>
             <div className="jumbotron text-center">
             <Search
                 onChange={this.searchValue}
                 value={searchTerm}
                 onSubmit={this.onSubmit}
              >News App </Search>
             </div>
          </Row>
      </Grid>

       <Grid>
       <Row>
        <Table
          list={list}
          sortKey={sortKey}
          onSort={this.onSort}
          searchTerm={searchTerm}
          removeItem={this.removeItem}
        />



      <div className="text-center alert">
      { isLoading ? <Loading/>:
        <Button
        className="btn btn-success"
        onClick={ ()=> this.fetchTopStories(searchTerm, page + 1 )}>
        LOAD MORE
        </Button>
      }
      </div>
      </Row>
      </Grid>
    </div>
    );
  }
}


const Search = ({onChange,value,children, onSubmit}) => {
  return (
    <form onSubmit={onSubmit}>
    <FormGroup>

      <h1 style={{fontWeight:'bold'}}>  {children} </h1> <hr style={{border:'2px solid black',width:'100px'}}/>
        <div className="input-group">
    <input
    className="form-control width100 seachForm "
         type="text"
         onChange={onChange}
         value={value} />
         <span className="input-group-btn">
         <Button className="btn btn-primary searchBtn"
         type="submit"
         >
         Search
         </Button>
         </span>
         </div>
         </FormGroup>
    </form>
  )
}



const Table = ({ list, searchTerm, removeItem, sortKey, onSort}) => {
  return(
    <div className="col-sm-10 col-sm-offset-1">
   <div className="text-center">
   <hr/>
   <Sort
   className ="btn btn-xs btn-default sortBtn"
     sortKey={'TITLE'}
     onSort={onSort}
      activeSortKey={sortKey}
     >Title</Sort>


     <Sort
     className ="btn btn-xs btn-default sortBtn"
       sortKey={'AUTHOR'}
       onSort={onSort}
       activeSortKey={sortKey}
       >Author</Sort>


       <Sort
       className ="btn btn-xs btn-default sortBtn"
         sortKey={'POINTS'}
         onSort={onSort}
         activeSortKey={sortKey}
         >Points</Sort>


         <Sort
         className ="btn btn-xs btn-default sortBtn"
           sortKey={'COMMENTS'}
           onSort={onSort}
           activeSortKey = {sortKey}>Comments</Sort>

           <hr/>
   </div>

    {
     //list.filter(isSearched(searchTerm) ).map(item =>
     SORTS[sortKey](list).map(item =>
        <div key={item.objectID}>
         <h1> <a href={item.url}> {item.title}</a> by {item.author} </h1>
         <h4> {item.num_comments} Comments | {item.points} Points
          {/* to use this keyword use arrow function not the old function*/}
          <Button
          className="btn-btn-danger btn-xs"
          type="button"
           onClick={()=> removeItem(item.objectID)}>
            Remove

          </Button>
          </h4> <hr/>

     </div>


      )
    }
    </div>
  )
}

export default Table;
