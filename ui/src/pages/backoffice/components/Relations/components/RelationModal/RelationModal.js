import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Modal } from 'semantic-ui-react';
import isEmpty from 'lodash/isEmpty';

export default class RelationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  onClose = () => {
    this.props.resetSelections();
  };

  toggle = () => {
    if (this.state.visible) {
      this.onClose();
    }
    this.setState({ visible: !this.state.visible });
  };

  onSave = () => {
    const {
      relationType,
      selections,
      extraRelationField,
      referrerRecord,
    } = this.props;

    delete extraRelationField.required;

    this.setState({ isLoading: true });
    this.props.createRelations(
      referrerRecord,
      selections,
      relationType,
      extraRelationField
    );
    this.setState({ isLoading: false });
    this.toggle();
  };

  render() {
    const {
      disabled,
      triggerButtonContent,
      modalHeader,
      isLoading,
      selections,
      extraRelationField,
    } = this.props;

    return (
      <Modal
        id="es-selector-modal"
        size="large"
        closeIcon
        trigger={
          <Button
            disabled={disabled}
            className="edit-related"
            icon
            labelPosition="left"
            positive
            onClick={this.toggle}
          >
            <Icon name="add" />
            {triggerButtonContent}
          </Button>
        }
        open={this.state.visible}
        centered={true}
        onClose={this.toggle}
      >
        <Modal.Header>{modalHeader}</Modal.Header>

        {this.props.children}

        <Modal.Actions>
          <Button onClick={() => this.toggle()}>Cancel</Button>
          <Button
            positive
            loading={isLoading}
            disabled={
              isEmpty(selections) ||
              (isEmpty(extraRelationField) && extraRelationField.required) ||
              isLoading
            }
            icon="checkmark"
            labelPosition="right"
            content="Confirm and save"
            onClick={this.onSave}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

RelationModal.propTypes = {
  disabled: PropTypes.bool.isRequired,
  triggerButtonContent: PropTypes.string.isRequired,
  modalHeader: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    .isRequired,
  isLoading: PropTypes.bool.isRequired,
  referrerRecord: PropTypes.object.isRequired,
  extraRelationField: PropTypes.object.isRequired,

  selections: PropTypes.array.isRequired,
};

RelationModal.defaultProps = {
  extraRelationField: {},
  disabled: false,
};
