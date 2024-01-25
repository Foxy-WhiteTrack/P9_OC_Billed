/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { ROUTES } from "../constants/routes.js";
import store from "../app/Store.js";

//TestUnitaire --- 

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    let onNavigateMock = jest.fn()

    beforeEach(() => {
      // première étape : créer l'environnement de test
      const html = NewBillUI()
      document.body.innerHTML = html

    });

    afterEach(() => {
      // quatrième étape : nettoyer l'environnement de test
      document.body.innerHTML = ''
    });

    test("Then NewBill has the correct title", () => {
      // deuxième étape : exécuter le code à tester
      const text = screen.getByText(/envoyer une note de frais/i);
      // troisième étape : vérifier que le résultat est celui attendu
      // vérifier si la class de text est bien "content-title"
      // expect(text).toHaveClass('content-title')
      expect($(text).hasClass('content-title')).toBeTruthy()
      expect(text).toBeTruthy()
    })

    describe("When the user submit a new bill", () => {

      // liste tests à faire dans le formulaire en matière de fonctionnalités
      test("Then the form is POST by user", async () => {
        // première étape : créer l'environnement de test
        const html = NewBillUI();
        document.body.innerHTML = html;
        // créer une instance de NewBill
        const newBill1 = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });
        // créer un mock dans le localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "test@test.fr",
          })
        );
        // simuler le changement de page
        const formNewBill = screen.getByTestId("form-new-bill");
        expect(formNewBill).toBeTruthy();
        // simuler le submit du formulaire
        const handleSubmit = jest.fn((e) => newBill1.handleSubmit(e));
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        // on attends comme réponse que la fonction handleSubmit soit appelée
        expect(handleSubmit).toHaveBeenCalled();
        // en asyncrone, on attends que la page soit chargée
        await waitFor(() => screen.getByTestId("btn-new-bill"));
      })

      describe("When the user send a good image format (jpg, jpeg, png etc...)", () => {
        test("then should not have an error message and the name of image should be displayed", async () => {
          // première étape : créer l'environnement de test
          document.body.innerHTML = NewBillUI();
          // créer une instance de NewBill
          const newbill = new NewBill({
            document,
            onNavigate,
            store: mockStore,
            localStorage: window.localStorage,
          });

          // intercepter les appels à la méthode handleChangeFile venant de newBill
          const handleChangeFile = jest.spyOn(newbill, "handleChangeFile");

          // récupérer l'input file
          const fileInput = screen.getByTestId("file");
          const file = new File(["file"], "example.jpg", {
            type: "image/jpg",
          });
          // intégrer l'écouteur d'event sur l'input file
          fileInput.addEventListener("change", handleChangeFile);
          userEvent.upload(fileInput, file);

          const errorMessage = screen.queryByTestId("error-message");

          // on attends comme réponse que la fonction handleChangeFile soit appelée sans erreur
          expect(handleChangeFile).toHaveBeenCalled();
          expect(fileInput.files[0]).toStrictEqual(file);
          expect(errorMessage).toBeNull();
        });
      });

      test("Then call update method on store", () => {

        const mockGetElementById = jest.fn()
        mockGetElementById.mockReturnValue({})

        localStorage.setItem("user", '{"email" : "johndoe@email.fr"}')

        // Création d'une fonction fictive pour la création de fichiers et d'un fichier image au bon format
        const goodFormatFile = new File(['img'], 'image.png', { type: 'image/png' })

        // Création d'un objet document fictif avec les méthodes querySelector et getElementById
        const documentMock = {
          querySelector: (s) => {
            if (s === 'input[data-testid="file"]') {
              return {
                files: [goodFormatFile],
                addEventListener: () => true,
              }
            } else {
              return { addEventListener: () => true }
            }
          },
          getElementById: mockGetElementById
        }
        // Création d'une fonction de mise à jour fictive (mock) qui renvoie une résolution vide
        const mockUpdate = jest.fn();
        mockUpdate.mockResolvedValue({})
        // Création d'un store fictif avec une méthode bills qui renvoie un objet contenant la méthode update
        const storeMock = {
          bills: () => {
            return {
              update: mockUpdate
            }
          }
        }
        // créer une instance de NewBill
        const objInstance = new NewBill({
          document: documentMock,
          onNavigate: () => { },
          store: storeMock,
          localStorage: {}
        });

        // Appel de la méthode handleSubmit de l'instance de NewBill
        objInstance.handleSubmit({
          preventDefault: () => true,
          target: {
            querySelector: (selector) => {
              switch (selector) {
                case 'select[data-testid="expense-type"]':
                  return { value: 'typedefrais' }
                  break;
                case 'input[data-testid="expense-name"]':
                  return { value: 'nom' }
                  break;
                case 'input[data-testid="amount"]':
                  return { value: '44' };
                  break;
                case 'input[data-testid="datepicker"]':
                  return { value: 'date' };
                  break;
                case 'input[data-testid="vat"]':
                  return { value: 'tva' };
                  break;
                case 'input[data-testid="pct"]':
                  return { value: '42' };
                  break;
                case 'textarea[data-testid="commentary"]':
                  return { value: 'Commentaire utilisateur' }
                  break;
              }
            }
          }
        })

        // Création d'un objet contenant les données attendues
        const dataToCheck = {
          email: 'johndoe@email.fr',
          type: 'typedefrais',
          name: 'nom',
          amount: 44,
          date: 'date',
          vat: 'tva',
          pct: 42,
          commentary: 'Commentaire utilisateur',
          fileUrl: null,
          fileName: null,
          status: 'pending'
        }
        // Analyse des données passées à la fonction 
        const data = JSON.parse(mockUpdate.mock.calls[0][0].data);
        console.log('data?', data);

        expect(data).toMatchObject(dataToCheck)
      })
      // Quand il y a une erreur
      describe("When an error occurs", () => {
        test("should fail with 500 message error", async () => {
          jest.spyOn(mockStore, "bills");
          Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
          });
          window.localStorage.setItem(
            "user",
            JSON.stringify({
              type: "Employee",
              email: "a@a",
            })
          );
          mockStore.bills.mockImplementationOnce(() => {
            return {
              create: () => {
                return Promise.reject(new Error("Erreur 500"));
              },
            };
          });
          const html = BillsUI({ error: "Erreur 500" });
          document.body.innerHTML = html;
          const message = await screen.getByText(/Erreur 500/);
          expect(message).toBeTruthy();
        });
      });
    });

  })


});

