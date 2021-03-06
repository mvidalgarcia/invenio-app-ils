import isEmpty from 'lodash/isEmpty';
import _get from 'lodash/get';
import _set from 'lodash/set';
import { invenioConfig } from '@config';
import { fromISO } from './date';

export const prepareDateQuery = (field, date, dateFrom, dateTo) => {
  if (
    (!date || typeof date !== 'string') &&
    (!dateFrom || typeof dateFrom !== 'string') &&
    (!dateTo || typeof dateTo !== 'string')
  ) {
    throw TypeError(
      'Date arguments invalid or missing ' +
        '-  at least one date string required'
    );
  }
  if (date) {
    return encodeURI(`${field}:${date}`);
  }
  if (dateFrom && dateTo) {
    return encodeURI(`${field}:{${dateFrom} TO ${dateTo}}`);
  } else if (dateFrom) {
    return encodeURI(`${field}:{${dateFrom} TO *}`);
  } else {
    return encodeURI(`${field}:{* TO ${dateTo}}`);
  }
};

export const prepareSumQuery = param => {
  if (Array.isArray(param)) {
    const paramQuery = param.join(' OR ');
    return `(${paramQuery})`;
  } else {
    return param;
  }
};

export const recordToPidType = record => {
  if (record.metadata.pidType) {
    return record.metadata.pidType;
  }
  return schemaToPidType(record.metadata['$schema']);
};

export const schemaToPidType = schema => {
  if (schema.includes('documents/document')) {
    return 'docid';
  } else if (schema.includes('eitems/eitem')) {
    return 'eitmid';
  } else if (schema.includes('internal_locations/internal_location')) {
    return 'ilocid';
  } else if (schema.includes('items/item')) {
    return 'pitmid';
  } else if (schema.includes('loans/loan')) {
    return 'loanid';
  } else if (schema.includes('locations/location')) {
    return 'locid';
  } else if (schema.includes('patrons/patron')) {
    return 'patid';
  } else if (schema.includes('series/series')) {
    return 'serid';
  } else if (schema.includes('borrowing_requests/borrowing_request')) {
    return 'illbid';
  } else {
    throw new Error(`Failed to get pid type for schema: ${schema}`);
  }
};

export const sequenceRelationPayload = (
  referrer,
  selectedRelated,
  extraRelationField
) => {
  /* it means that the referrer is continued by the selection */
  if (extraRelationField.type === 'next') {
    return {
      next_pid: selectedRelated.metadata.pid,
      next_pid_type: recordToPidType(selectedRelated),
      previous_pid: referrer.metadata.pid,
      previous_pid_type: recordToPidType(referrer),
      relation_type: 'sequence',
    };
  } else if (extraRelationField.type === 'previous') {
    return {
      next_pid: referrer.metadata.pid,
      next_pid_type: recordToPidType(referrer),
      previous_pid: selectedRelated.metadata.pid,
      previous_pid_type: recordToPidType(selectedRelated),
      relation_type: 'sequence',
    };
  } else {
    throw TypeError('Wrong sequence type. Should be previous or next.');
  }
};

export const parentChildRelationPayload = (
  relationType,
  extra,
  parent,
  child
) => {
  return {
    parent_pid: parent.metadata.pid,
    parent_pid_type: recordToPidType(parent),
    child_pid: child.metadata.pid,
    child_pid_type: recordToPidType(child),
    relation_type: relationType,
    ...extra,
  };
};

export const siblingRelationPayload = (relationType, extra, second) => {
  return {
    pid: second.metadata.pid,
    pid_type: recordToPidType(second),
    relation_type: relationType,
    ...extra,
  };
};

export const formatPrice = (price, includeCurrency = true) => {
  if (!price) return null;

  const options = includeCurrency
    ? {
        style: 'currency',
        currency: price.currency,
      }
    : {
        maximumFractionDigits: 2,
      };

  return new Intl.NumberFormat(invenioConfig.i18n.priceLocale, options).format(
    price.value
  );
};

export const recordResponseSerializer = (hit, customSerializer = null) => {
  const DATETIME_FIELDS = ['created', 'updated'];
  const result = {};
  if (!isEmpty(hit)) {
    result.id = hit.id;

    DATETIME_FIELDS.forEach(field => {
      const datetimeStr = _get(hit, field);
      if (datetimeStr) {
        _set(result, field, fromISO(datetimeStr));
      }
    });

    if (hit.links) {
      result.links = hit.links;
    }

    if (!isEmpty(hit.metadata)) {
      result.metadata = hit.metadata;
      if (customSerializer) {
        customSerializer(result.metadata);
      }
      result.pid = hit.metadata.pid;
    }
  }
  return result;
};
