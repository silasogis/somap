import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/authHandlers';
import { layerHandlers } from './handlers/layerHandlers';
import { publicRaioXHandlers } from './handlers/publicRaioXHandlers';

export const worker = setupWorker(...authHandlers, ...layerHandlers, ...publicRaioXHandlers);
