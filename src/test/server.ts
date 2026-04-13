import { setupServer } from 'msw/node';
import { handlers } from './handlers/pokeapi';

export const server = setupServer(...handlers);
