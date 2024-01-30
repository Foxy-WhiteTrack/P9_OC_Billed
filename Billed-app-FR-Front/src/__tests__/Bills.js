/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import mockStore from "../__mocks__/store.js";


import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

import { ROUTES_PATH, ROUTES } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage";

jest.mock("../app/Store", () => mockStore);

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })

    describe("When an error occurs on API", () => {
      test("Then getBills should fail with a 404 error", async () => {
        mockStore.bills = jest.fn().mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")))
        document.body.innerHTML = BillsUI({ error: "Erreur 404" })
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      //Récupère tous les éléments qui contiennent une date
      const dateElements = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(element => element.textContent);
      // Transforme la liste de dates en tableau
      const dates = Array.from(dateElements).map(element => element.textContent);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
      document.body.innerHTML = ""
    })
    test("Then the modal should open when clicking on the eye icon", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = BillsUI({ data: bills });
      const bills2 = new Bills({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });
      const handleClickIconEye = jest.fn((icon) =>
        bills2.handleClickIconEye(icon)
      );
      const modaleFile = document.getElementById("modaleFile");
      const iconEye = screen.getAllByTestId("icon-eye");
      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));
      iconEye.forEach((icon) => {
        icon.addEventListener("click", handleClickIconEye(icon));
        userEvent.click(icon);
        expect(handleClickIconEye).toHaveBeenCalled();
      });
      expect(modaleFile).toHaveClass("show");
      document.body.innerHTML = "";
    });
  })
})

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      //Récupère tous les éléments selon la regex et extrait le contenu HTML
      const dateElements = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(element => element.textContent);
      //Crée un nouveau tableau et extrait juste le contenu 
      const dates = Array.from(dateElements).map(element => element.textContent);
      // Définit une fonction de tri et tri les dates
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    });
  });
  describe("When the function handleClickIconEye() of class Bills is used", () => {
    test("Then it should open modal", () => {
      // Crée un élément simulé pour la fenêtre modale
      const modal = document.createElement("div");
      modal.setAttribute("id", "modaleFile");

      // Crée un élément simulé pour le contenu de la fenêtre modale
      const modalContent = document.createElement("div");
      modalContent.setAttribute("class", "modal-body");
      modal.append(modalContent);
      document.body.append(modal);

      // Crée une fonction mock pour la méthode modal de jQuery
      const mockFn = jest.fn((arg) => true);
      // Attribue la fonction mock à la méthode modal de jQuery globalement
      global.$.fn.modal = mockFn;

      const documentMock = {
        querySelector: () => null,
        querySelectorAll: () => null,
      };

      const storeMock = {
        bills: () => ({
          list: () => ({
            then: (fn) => fn(bills),
          }),
        }),
      };

      // Crée une instance simulée de la classe Bills avec les mocks
      const billsObject = new Bills({
        document: documentMock,
        onNavigate: {},
        store: storeMock,
        localStorage: {},
      });

      // Appelle la méthode handleClickIconEye avec un attribut fictif
      billsObject.handleClickIconEye({ getAttribute: () => "fakeUrl" });
      // Vérifie si la fonction mock a été appelée une fois
      expect(mockFn.mock.calls).toHaveLength(1);
    });
  });
});