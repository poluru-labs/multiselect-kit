import { Component, CUSTOM_ELEMENTS_SCHEMA, type AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import type { MsChangeDetail, MsMultiselect, MsOption } from '@poluru-labs/multiselect-kit';
import '@poluru-labs/multiselect-kit';

const OPTIONS: MsOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'eng', label: 'Engineering' },
  { value: 'ops', label: 'Operations' },
];

@Component({
  selector: 'app-multiselect-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ms-multiselect
      #host
      label="Departments"
      placeholder="Select departments"
    ></ms-multiselect>
  `,
})
export class MultiselectExampleComponent implements AfterViewInit {
  @ViewChild('host') host!: ElementRef<MsMultiselect>;

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;
    el.options = OPTIONS;
    el.value = ['eng'];
    el.addEventListener('change', (event: Event) => {
      const value = (event as CustomEvent<MsChangeDetail>).detail.value;
      console.log(value);
    });
  }
}
