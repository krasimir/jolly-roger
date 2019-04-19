/* eslint-disable no-sequences */
import React, { useEffect, useState } from 'react';
import { render, fireEvent } from 'react-testing-library';

import roger from '../index';

describe('Given the Jolly Roger library', () => {
  beforeEach(() => {
    roger.flush();
  });
  describe('when we use the Roger\'s useContext/context', () => {
    it('should allow us to define methods in the context which accept an action', () => {
      roger.context({
        multiply(data) {
          return data.number * 2;
        }
      })

      const A = function () {
        const { multiply } = roger.useContext();
        const [ foo, setFoo ] = useState(0);

        return (
          <button data-testid='button' onClick={ () => setFoo(multiply({ number: 12 })) }>
            { foo }
          </button>
        );
      };

      const { container, getByTestId } = render(<A />);

      expect(container.textContent).toEqual('0');

      fireEvent.click(getByTestId('button'));

      expect(container.textContent).toEqual('24');
    });
    it(`should allow us to update roger's state`, () => {
      roger.context({
        multiply(data, { setNumber }) {
          setNumber(data.number * 2);
        }
      });
      roger.useReducer('foo', {
        setNumber(oldValue, newValue) {
          return newValue;
        }
      });

      const B = function () {
        const { multiply } = roger.useContext();
        const [ foo ] = roger.useState('foo', 13);

        return (
          <button data-testid='button2' onClick={ () => multiply({ number: 33 }) }>
            { foo }
          </button>
        );
      };

      const { container, getByTestId } = render(<B />);

      expect(container.textContent).toEqual('13');

      fireEvent.click(getByTestId('button2'));

      expect(container.textContent).toEqual('66');
    });
  });
});
