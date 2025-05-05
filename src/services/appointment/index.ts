
import { fetchAppointments, fetchAppointmentById } from './fetchAppointments';
import { createAppointment } from './createAppointment';
import { blockTimeSlot } from './blockTimeSlot';
import { fetchAvailableTimeSlots } from './availableTimeSlots';
import { cancelAppointment } from './cancelAppointment';
import { registerAppointmentPayment } from './paymentService';

export {
  fetchAppointments,
  fetchAppointmentById,
  createAppointment,
  blockTimeSlot,
  fetchAvailableTimeSlots,
  cancelAppointment,
  registerAppointmentPayment
};
