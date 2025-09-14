import { JOB_NAMES as NOTIFICATION_JOB_NAMES } from '../../../../apps/notification/src/utils/constants';
import { JOB_NAMES as VENDOR_JOB_NAMES } from '../../../../apps/vendor/src/utils /constants';

export const RABBITMQ_QUEUES = {
  GATEWAY: 'GATEWAY',
  VENDOR: 'VENDOR',
  FILE: 'FILE',
  NOTIFICATION: 'NOTIFICATION',
  CLIENT: 'CLIENT',
  PAYMENT: 'PAYMENT',
  ORDER: 'ORDER',
};

export const APP_JOB_NAMES = {
  ...NOTIFICATION_JOB_NAMES,
  ...VENDOR_JOB_NAMES,
};
