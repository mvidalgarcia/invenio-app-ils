import { connect } from 'react-redux';
import { fetchPatronDocumentRequests } from '@state/PatronDocumentRequests/actions';
import PatronDocumentRequestsComponent from './PatronDocumentRequests';

const mapStateToProps = state => ({
  data: state.patronDocumentRequests.data,
  error: state.patronDocumentRequests.error,
  isLoading: state.patronDocumentRequests.isLoading,
  hasError: state.patronDocumentRequests.hasError,
  patronDetails: state.patronDetails.data,
});

const mapDispatchToProps = dispatch => ({
  fetchPatronDocumentRequests: (patronPid, page) =>
    dispatch(fetchPatronDocumentRequests(patronPid, page)),
});

export const PatronDocumentRequests = connect(
  mapStateToProps,
  mapDispatchToProps
)(PatronDocumentRequestsComponent);
