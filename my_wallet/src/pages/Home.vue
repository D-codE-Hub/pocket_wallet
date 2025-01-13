<!-- <template>
  <h2 class="p-10 mt-4">Hello {{ session.user }}</h2>
  <div></div>
  <div class="p-5">
    <div class="sm:flex justify-center gap-3">
      <div class="sm:flex">
        <div>
          <Card title="Expense" subtitle="This Month" />
          <Card title="Login to your Pocket Wallet" />
        </div>
        <div>
          <Card title="Income" subtitle="This Month" />
          <Card title="Login to your Pocket Wallet" />
        </div>
      </div>
      <div class="sm:flex  flex-col justify-center gap-3">
        <div class="">
          <div>
            <TabButtons :buttons="[
              {
                label: 'Expense',
                value: 'Expense',
              },
              {
                label: 'Income',
                value: 'Income',
              },
            ]" v-model="type" />
          </div>
        </div>

        <div class="sm:flex flex-row">
          <div class="p-2 w-52">
            <FormControl :type="'datetime-local'" :ref_for="true" size="sm" variant="subtle" placeholder="Placeholder"
              :disabled="false" label="Label" v-model="date" />
          </div>

          <div class="p-2 w-52">
            <FormControl :type="'text'" :ref_for="true" size="sm" variant="subtle" placeholder="00.00" :disabled="false"
              label="Amount" v-model="amount" />

          </div>
        </div>

        <div class="sm:flex">
          <div class="p-2 w-52">
            <Select :options="getCategorys()" v-model="cats" />
          </div>
          <div class="p-2 w-52">
            <Select :options="getAccounts()" v-model="acts" />
          </div>
        
        </div>
        <div class="p-2">
            <FormControl :type="'text'" :ref_for="true" size="sm" variant="subtle" placeholder="" :disabled="false"
              label="Notes" v-model="notes" />

          </div>
        <div class="p-1 mr-8 flex justify-end">
          <Button :variant="'solid'" :ref_for="true" theme="gray" size="sm" label="Save" :loading="false"
            :loadingText="null" @click="createMyWallet()" :disabled="false" :link="null">
          </Button>
        </div>
      </div>


    </div>
    <ListView class="p-10" v-if="todos.data" :columns="[
      {
        label: 'Name',
        key: 'name',
        width: 3,
        getLabel: ({ row }) => row.name,
      },
      {
        label: 'Category',
        key: 'category',
        width: '200px',
      },
      {
        label: 'Type',
        key: 'type',
      },
      {
        label: 'Amount',
        key: 'amount',
      },
      {
        label: 'Status',
        key: 'status',
      },
    ]" :rows="todos.data" :options="{
        // getRowRoute: (row) => ({ name: 'User', params: { userId: row.id } }),
        selectable: true,
        showTooltip: true,
        resizeColumn: true,

        emptyState: {
          title: 'No records found',
          description: 'Create a new record to get started',
          button: {
            label: 'New Record',
            variant: 'solid',
            onClick: () => console.log('New Record'),
          },
        }
      }" row-key="name" />

  </div>



  <Dialog
  :options="{
    title: 'My Wallet',
    message: 'Entry Added Successfully',
    size: 'sm',
    // icon: {
    //   name: 'alert-triangle',
    //   appearance: 'warning',
    // },
    // actions: [
    //   {
    //     label: 'Confirm',
    //     variant: 'solid',
    //     onClick: () => {
    //                   return createPromise();
    //                 },
    //   },
    // ],
  }"
  v-model="dialog1"
/>
<label
    for="Username"
    class="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
  >
    <input
      type="text"
      id="Username"
      class="peer border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0"
      placeholder="Username"
    />
  
    <span
      class="pointer-events-none absolute start-2.5 top-0 -translate-y-1/2 bg-white p-0.5 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs"
    >
      Username
    </span>
  </label>
</template> -->


<template>
  <header class="bg-white">
    <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex-1 md:flex md:items-center md:gap-12">
          <a class="block text-teal-600" href="#">
            <span class="sr-only">Home</span>
            <svg class="h-8" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0.41 10.3847C1.14777 7.4194 2.85643 4.7861 5.2639 2.90424C7.6714 1.02234 10.6393 0 13.695 0C16.7507 0 19.7186 1.02234 22.1261 2.90424C24.5336 4.7861 26.2422 7.4194 26.98 10.3847H25.78C23.7557 10.3549 21.7729 10.9599 20.11 12.1147C20.014 12.1842 19.9138 12.2477 19.81 12.3047H19.67C19.5662 12.2477 19.466 12.1842 19.37 12.1147C17.6924 10.9866 15.7166 10.3841 13.695 10.3841C11.6734 10.3841 9.6976 10.9866 8.02 12.1147C7.924 12.1842 7.8238 12.2477 7.72 12.3047H7.58C7.4762 12.2477 7.376 12.1842 7.28 12.1147C5.6171 10.9599 3.6343 10.3549 1.61 10.3847H0.41ZM23.62 16.6547C24.236 16.175 24.9995 15.924 25.78 15.9447H27.39V12.7347H25.78C24.4052 12.7181 23.0619 13.146 21.95 13.9547C21.3243 14.416 20.5674 14.6649 19.79 14.6649C19.0126 14.6649 18.2557 14.416 17.63 13.9547C16.4899 13.1611 15.1341 12.7356 13.745 12.7356C12.3559 12.7356 11.0001 13.1611 9.86 13.9547C9.2343 14.416 8.4774 14.6649 7.7 14.6649C6.9226 14.6649 6.1657 14.416 5.54 13.9547C4.4144 13.1356 3.0518 12.7072 1.66 12.7347H0V15.9447H1.61C2.39051 15.924 3.154 16.175 3.77 16.6547C4.908 17.4489 6.2623 17.8747 7.65 17.8747C9.0377 17.8747 10.392 17.4489 11.53 16.6547C12.1468 16.1765 12.9097 15.9257 13.69 15.9447C14.4708 15.9223 15.2348 16.1735 15.85 16.6547C16.9901 17.4484 18.3459 17.8738 19.735 17.8738C21.1241 17.8738 22.4799 17.4484 23.62 16.6547ZM23.62 22.3947C24.236 21.915 24.9995 21.664 25.78 21.6847H27.39V18.4747H25.78C24.4052 18.4581 23.0619 18.886 21.95 19.6947C21.3243 20.156 20.5674 20.4049 19.79 20.4049C19.0126 20.4049 18.2557 20.156 17.63 19.6947C16.4899 18.9011 15.1341 18.4757 13.745 18.4757C12.3559 18.4757 11.0001 18.9011 9.86 19.6947C9.2343 20.156 8.4774 20.4049 7.7 20.4049C6.9226 20.4049 6.1657 20.156 5.54 19.6947C4.4144 18.8757 3.0518 18.4472 1.66 18.4747H0V21.6847H1.61C2.39051 21.664 3.154 21.915 3.77 22.3947C4.908 23.1889 6.2623 23.6147 7.65 23.6147C9.0377 23.6147 10.392 23.1889 11.53 22.3947C12.1468 21.9165 12.9097 21.6657 13.69 21.6847C14.4708 21.6623 15.2348 21.9135 15.85 22.3947C16.9901 23.1884 18.3459 23.6138 19.735 23.6138C21.1241 23.6138 22.4799 23.1884 23.62 22.3947Z"
                fill="currentColor" />
            </svg>
          </a>
        </div>

        <div class="md:flex md:items-center md:gap-12">
          <nav aria-label="Global" class="hidden md:block">
            <ul class="flex items-center gap-6 text-sm">
              <li>
                <a class="text-gray-500 transition hover:text-gray-500/75" href="#"> About </a>
              </li>

              <li>
                <a class="text-gray-500 transition hover:text-gray-500/75" href="#"> Careers </a>
              </li>

              <li>
                <a class="text-gray-500 transition hover:text-gray-500/75" href="#"> History </a>
              </li>

              <li>
                <a class="text-gray-500 transition hover:text-gray-500/75" href="#"> Services </a>
              </li>

              <li>
                <a class="text-gray-500 transition hover:text-gray-500/75" href="#"> Projects </a>
              </li>

              <li>
                <a class="text-gray-500 transition hover:text-gray-500/75" href="#"> Blog </a>
              </li>
            </ul>
          </nav>

          <!-- <div class="hidden md:relative md:block">
            <button
              type="button"
              class="overflow-hidden rounded-full border border-gray-300 shadow-inner"
            >
              <span class="sr-only">Toggle dashboard menu</span>
  
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt=""
                class="size-10 object-cover"
              />
            </button>
  
            <div
              class="absolute end-0 z-10 mt-0.5 w-56 divide-y divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg"
              role="menu"
            >
              <div class="p-2">
                <a
                  href="#"
                  class="block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  role="menuitem"
                >
                  My profile
                </a>
  
                <a
                  href="#"
                  class="block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  role="menuitem"
                >
                  Billing summary
                </a>
  
                <a
                  href="#"
                  class="block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  role="menuitem"
                >
                  Team settings
                </a>
              </div>
  
              <div class="p-2">
                <form method="POST" action="#">
                  <button
                    type="submit"
                    class="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    role="menuitem"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                      />
                    </svg>
  
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </div>
  
          <div class="block md:hidden">
            <button class="rounded bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div> -->
        </div>
      </div>
    </div>
  </header>


  <!-- component -->
  <div class=" bg-gray-100 flex flex-col sm:flex-row items-center justify-center p-4">

    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 m-5">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">My Wallet</h2>

      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="your@email.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="••••••••" />
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span class="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" class="text-sm text-indigo-600 hover:text-indigo-500">Forgot password?</a>
        </div>

        <button
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors">
          Sign In
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-600">
        Don't have an account?
        <a href="#" class="text-indigo-600 hover:text-indigo-500 font-medium">Sign up</a>
      </div>
    </div>
    <div class="rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
      <form action="#" class="space-y-4">
        <div>
          <label class="sr-only" for="name">Name</label>
          <input class="w-full rounded-lg border-gray-200 p-3 text-sm" placeholder="Name" type="text" id="name" />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="sr-only" for="email">Email</label>
            <input class="w-full rounded-lg border-gray-200 p-3 text-sm" placeholder="Email address" type="email"
              id="email" />
          </div>

          <div>
            <label class="sr-only" for="phone">Phone</label>
            <input class="w-full rounded-lg border-gray-200 p-3 text-sm" placeholder="Phone Number" type="tel"
              id="phone" />
          </div>
          <div>
            <label class="sr-only" for="email">Email</label>
            <input class="w-full rounded-lg border-gray-200 p-3 text-sm" placeholder="Email address" type="email"
              id="email" />
          </div>

          <div>
            <label class="sr-only" for="phone">Phone</label>
            <input class="w-full rounded-lg border-gray-200 p-3 text-sm" placeholder="Phone Number" type="tel"
              id="phone" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
          <div>
            <label for="Option1"
              class="block w-full cursor-pointer rounded-lg border border-gray-200 p-3 text-gray-600 hover:border-black has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white"
              tabindex="0">
              <input class="sr-only" id="Option1" type="radio" tabindex="-1" name="option" />

              <span class="text-sm"> Option 1 </span>
            </label>
          </div>

          <div>
            <label for="Option2"
              class="block w-full cursor-pointer rounded-lg border border-gray-200 p-3 text-gray-600 hover:border-black has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white"
              tabindex="0">
              <input class="sr-only" id="Option2" type="radio" tabindex="-1" name="option" />

              <span class="text-sm"> Option 2 </span>
            </label>
          </div>

          <div>
            <label for="Option3"
              class="block w-full cursor-pointer rounded-lg border border-gray-200 p-3 text-gray-600 hover:border-black has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white"
              tabindex="0">
              <input class="sr-only" id="Option3" type="radio" tabindex="-1" name="option" />

              <span class="text-sm"> Option 3 </span>
            </label>
          </div>
        </div>

        <div>
          <label class="sr-only" for="message">Message</label>

          <textarea class="w-full rounded-lg border-gray-200 p-3 text-sm" placeholder="Message" rows="8"
            id="message"></textarea>
        </div>

        <div class="mt-4">
          <button type="submit"
            class="inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto">
            Send Enquiry
          </button>
        </div>
      </form>
    </div>
  </div>




  <!-- component -->
  <section class="antialiased bg-gray-100 text-gray-600 px-4">
    <div class="flex flex-col justify-center">
      <!-- Table -->
      <div class="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200">
        <header class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Customers</h2>
        </header>
        <div class="p-3">
          <div class="overflow-x-auto">
            <table class="table-auto w-full">
              <thead class="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                <tr>
                  <th class="p-2 whitespace-nowrap">
                    <div class="font-semibold text-left">Name</div>
                  </th>
                  <th class="p-2 whitespace-nowrap">
                    <div class="font-semibold text-left">Email</div>
                  </th>
                  <th class="p-2 whitespace-nowrap">
                    <div class="font-semibold text-left">Spent</div>
                  </th>
                  <th class="p-2 whitespace-nowrap">
                    <div class="font-semibold text-center">Country</div>
                  </th>
                </tr>
              </thead>
              <tbody class="text-sm divide-y divide-gray-100">
                <tr>
                  <td class="p-2 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img class="rounded-full"
                          src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-05.jpg"
                          width="40" height="40" alt="Alex Shatov"></div>
                      <div class="font-medium text-gray-800">Alex Shatov</div>
                    </div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-left">alexshatov@gmail.com</div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-left font-medium text-green-500">$2,890.66</div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-lg text-center">🇺🇸</div>
                  </td>
                </tr>
                <!-- <tr>
                  <td class="p-2 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img class="rounded-full"
                          src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-06.jpg"
                          width="40" height="40" alt="Philip Harbach"></div>
                      <div class="font-medium text-gray-800">Philip Harbach</div>
                    </div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-left">philip.h@gmail.com</div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-left font-medium text-green-500">$2,767.04</div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-lg text-center">🇩🇪</div>
                  </td>
                </tr>
                <tr>
                  <td class="p-2 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img class="rounded-full"
                          src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-07.jpg"
                          width="40" height="40" alt="Mirko Fisuk"></div>
                      <div class="font-medium text-gray-800">Mirko Fisuk</div>
                    </div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-left">mirkofisuk@gmail.com</div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-left font-medium text-green-500">$2,996.00</div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-lg text-center">🇫🇷</div>
                  </td>
                </tr>
                <tr>
                  <td class="p-2 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img class="rounded-full"
                          src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-08.jpg"
                          width="40" height="40" alt="Olga Semklo"></div>
                      <div class="font-medium text-gray-800">Olga Semklo</div>
                    </div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-left">olga.s@cool.design</div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-left font-medium text-green-500">$1,220.66</div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-lg text-center">🇮🇹</div>
                  </td>
                </tr>
                <tr>
                  <td class="p-2 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3"><img class="rounded-full"
                          src="https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-09.jpg"
                          width="40" height="40" alt="Burak Long"></div>
                      <div class="font-medium text-gray-800">Burak Long</div>
                    </div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-left">longburak@gmail.com</div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-left font-medium text-green-500">$1,890.66</div>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <div class="text-lg text-center">🇬🇧</div>
                  </td>
                </tr> -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup>
import {
  createListResource, Select, ListView, TabButtons, FormControl,
  createResource, DateTimePicker, Dialog
} from 'frappe-ui'
import { session } from '../data/session'
import { ref, computed, watchEffect } from 'vue'

const type = ref('Expense')
const inputValue = ref('')
const amount = ref('')
const date = ref('')
const cats = ref('')
const acts = ref('')
const notes = ref('')
const dialog1 = ref(false)


let todos = createListResource({
  doctype: 'My Wallet',
  fields: ['name', 'category', 'type', 'amount', 'status'],
  orderBy: 'creation desc',
  start: 0,
})
todos.fetch()


let categorys = createListResource({
  doctype: 'Wallet Category',
  fields: ['name', 'color', 'icon'],
  orderBy: 'creation desc',
  start: 0,
})
categorys.fetch()

const getCategorys = () => {
  let cts = []
  if (categorys.data) {
    for (const category of categorys.data) {
      cts.push({
        label: category.name,
        value: category.name,
      })
    }
  }
  return cts
}

let accounts = createListResource({
  doctype: 'Wallet Account',
  fields: ['name'],
  orderBy: 'creation desc',
  start: 0,
})
accounts.fetch()

const getAccounts = () => {
  let acs = []
  if (accounts.data) {
    for (const account of accounts.data) {
      acs.push({
        label: account.name,
        value: account.name,
      })
    }
  }
  return acs
}
function createMyWallet() {
  let my_w = createResource({
    url: 'pocket_wallet.api.craete_my_wallet',
    makeParams() {
      return {
        data: {
          "type": type.value,
          "category": cats.value,
          "amount": amount.value,
          "account": acts.value,
          "date": date.value,
          "note": notes.value,
        }
      }
    },
    onSuccess(data) {
      dialog1.value = true
      // frappe.msgprint("Haaaiiiii")
      todos.fetch()
    },
  })
  my_w.fetch()
}
</script>
